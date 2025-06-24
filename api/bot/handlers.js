import yts from 'yt-search';
import { exec } from 'child_process';
import { createReadStream, unlinkSync } from 'fs';
import { resolve as _resolve } from 'path';
import { isAudioSizeAcceptable } from '../utils/audioUtils.js';
import { safeDownloadImage } from '../utils/downloadUtils.js';
import { isUserAllowed } from '../access/allowedUsers.js';

const RESULTS_PER_PAGE = 5;

function getKeyboard(videos, page) {
  const totalPages = Math.ceil(videos.length / RESULTS_PER_PAGE);
  const keyboard = videos.slice(page * RESULTS_PER_PAGE, (page + 1) * RESULTS_PER_PAGE).map((video, index) => ([
    { text: video.title.slice(0, 50), callback_data: `select_${page * RESULTS_PER_PAGE + index}` }
  ]));

  const nav = [];
  if (page > 0) nav.push({ text: '⬅️', callback_data: `nav_${page - 1}` });
  nav.push({ text: `${page + 1} / ${totalPages}`, callback_data: `noop` });
  if ((page + 1) * RESULTS_PER_PAGE < videos.length) nav.push({ text: '➡️', callback_data: `nav_${page + 1}` });

  keyboard.push(nav);
  return { reply_markup: { inline_keyboard: keyboard } };
}

export async function onMessage(bot, msg, searchCache, __dirname) {
  const username = msg.from?.username;
  const chatId = msg.chat?.id;
    if (!isUserAllowed(username)) {
    return bot.sendMessage(chatId, 'access denied');
  }
  const text = msg.text;
  if (!text) return;

  if (
    text.startsWith('https://youtube.com/') ||
    text.startsWith('https://www.youtube.com/') ||
    text.startsWith('https://youtu.be/')
  ) {
    const url = text.trim();
    try {
      const result = await yts({ url });
      const video = result.videos[0];

      if (!isAudioSizeAcceptable(video.duration.timestamp)) {
        return bot.sendMessage(chatId, 'Audio file is too large (>15MB), skipping download.');
      }

      const safeTitle = video.title.replace(/[\\\/:*?"<>|]/g, '');
      const safeFileName = `audio_${chatId}_${Date.now()}_${safeTitle}.mp3`;

      bot.sendMessage(chatId, `Downloading audio from direct link...`);

      const command = `yt-dlp -x --audio-format mp3 -o "${safeFileName}" "${url}"`;

      exec(command, async (error) => {
        if (error) {
          bot.sendMessage(chatId, 'Error downloading file');
          console.error(error);
          return;
        }

        const filePath = _resolve(__dirname, safeFileName);
        const thumbFileName = `thumb_${chatId}_${Date.now()}.jpg`;
        const thumbFilePath = _resolve(__dirname, thumbFileName);

        const thumbDownloaded = await safeDownloadImage(video.thumbnail, thumbFilePath, chatId, bot);

        try {
          if (thumbDownloaded) {
            await bot.sendAudio(chatId, createReadStream(filePath), {
              thumb: thumbFilePath,
              title: video.title,
              performer: video.author.name,
              caption: `[open in YouTube](${url})`,
              parse_mode: "Markdown"
            });
            unlinkSync(thumbFilePath);
          } else {
            await bot.sendAudio(chatId, createReadStream(filePath), {
              title: video.title,
              performer: video.author.name,
              caption: `[open in YouTube](${url})`,
              parse_mode: "Markdown"
            });
          }
          unlinkSync(filePath);
        } catch (e) {
          bot.sendMessage(chatId, 'Error sending audio with thumbnail');
          console.error(e);
        }
      });
    } catch (e) {
      bot.sendMessage(chatId, 'Error processing video info');
      console.error(e);
    }
  } else {
    bot.sendMessage(chatId, `Searching: "${text}" on YouTube...`);
    try {
      const result = await yts(text);
      const videos = result.videos;
      if (!videos.length) return bot.sendMessage(chatId, 'Video not found.');

      searchCache.set(chatId, { results: videos, page: 0 });
      bot.sendMessage(chatId, 'Choose track:', getKeyboard(videos, 0));
    } catch (e) {
      bot.sendMessage(chatId, 'Unknown error, try again.');
      console.error(e);
    }
  }
}

export async function onCallbackQuery(bot, query, searchCache, __dirname) {
  const chatId = query.message.chat.id;
  const data = query.data;
  const cache = searchCache.get(chatId);
  if (!cache) return bot.answerCallbackQuery(query.id, { text: 'Timeout' });

  const { results, page } = cache;

  if (data.startsWith('nav_')) {
    const newPage = parseInt(data.split('_')[1]);
    cache.page = newPage;
    searchCache.set(chatId, cache);
    bot.editMessageReplyMarkup(getKeyboard(results, newPage).reply_markup, {
      chat_id: chatId,
      message_id: query.message.message_id
    });
    return bot.answerCallbackQuery(query.id);
  }

  if (data.startsWith('select_')) {
    const index = parseInt(data.split('_')[1]);
    const video = results[index];

    if (!isAudioSizeAcceptable(video.duration.timestamp)) {
      return bot.sendMessage(chatId, 'Audio file is too large (>15MB), skipping download.');
    }

    const url = video.url;
    const safeTitle = video.title.replace(/[\\\/:*?"<>|]/g, '');
    const safeFileName = `audio_${chatId}_${Date.now()}_${safeTitle}.mp3`;

    bot.sendMessage(chatId, `Downloading: ${video.title}`);

    const command = `yt-dlp -x --audio-format mp3 -o "${safeFileName}" "${url}"`;

    exec(command, async (error) => {
      if (error) {
        bot.sendMessage(chatId, 'Error downloading file');
        console.error(error);
        return;
      }

      const filePath = _resolve(__dirname, safeFileName);
      const thumbFileName = `thumb_${chatId}_${Date.now()}.jpg`;
      const thumbFilePath = _resolve(__dirname, thumbFileName);

      const thumbDownloaded = await safeDownloadImage(video.thumbnail, thumbFilePath, chatId, bot);

      try {
        if (thumbDownloaded) {
          await bot.sendAudio(chatId, createReadStream(filePath), {
            thumb: thumbFilePath,
            title: video.title,
            performer: video.author.name,
            caption: `[open in YouTube](${url})`,
            parse_mode: "Markdown"
          });
          unlinkSync(thumbFilePath);
        } else {
          await bot.sendAudio(chatId, createReadStream(filePath), {
            title: video.title,
            performer: video.author.name,
            caption: `[open in YouTube](${url})`,
            parse_mode: "Markdown"
          });
        }
        unlinkSync(filePath);
      } catch (e) {
        bot.sendMessage(chatId, 'Error sending audio with thumbnail');
        console.error(e);
      }
    });

    return bot.answerCallbackQuery(query.id, { text: 'Downloading...' });
  }

  if (data === 'noop') {
    return bot.answerCallbackQuery(query.id);
  }
}

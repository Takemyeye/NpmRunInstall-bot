import { get } from 'https';
import { downloadImage } from '../download/image.js';

export const MAX_FILE_SIZE = 15 * 1024 * 1024;

export function getFileSize(url) {
  return new Promise((resolve, reject) => {
    get(url, { method: 'HEAD' }, (res) => {
      const length = res.headers['content-length'];
      if (length) resolve(Number(length));
      else resolve(null);
    }).on('error', reject);
  });
}

export async function safeDownloadImage(url, filepath, chatId, bot) {
  try {
    const size = await getFileSize(url);
    if (size && size > MAX_FILE_SIZE) {
      await bot.sendMessage(chatId, 'Thumbnail image is too large, skipping.');
      return false;
    }
    await downloadImage(url, filepath);
    return true;
  } catch (e) {
    await bot.sendMessage(chatId, 'Error downloading thumbnail.');
    return false;
  }
}

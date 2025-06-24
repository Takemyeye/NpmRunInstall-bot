import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { cleanAudioFilesInDir } from './access/cleanAudioFiles.js';
import { onMessage, onCallbackQuery } from './bot/handlers.js';

dotenv.config();

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function startBot() {
  await cleanAudioFilesInDir(__dirname);
  console.log('Audio files cleanup done.');

  const token = process.env.TOKEN;

  console.log("Bot running");

  const bot = new TelegramBot(token, { polling: true });

  const searchCache = new Map();

  bot.on('message', (msg) => onMessage(bot, msg, searchCache, __dirname));
  bot.on('callback_query', (query) => onCallbackQuery(bot, query, searchCache, __dirname));
}

startBot().catch(console.error);

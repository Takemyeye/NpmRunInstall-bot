# 🎧 NpmRunInstall_bot

A Telegram bot that lets you **search** and **download audio** from YouTube by link or keyword — optimized to ensure files remain under Telegram's 15MB limit.

> 🔗 Live: [@NpmRunInstall_bot](https://t.me/NpmRunInstall_bot)

---

## ✨ Features

- 🔍 Search YouTube by message or link
- 🎵 Download audio as `.mp3` with title, performer, and thumbnail
- 🛑 Skips downloading if file would exceed 15MB
- 🔐 Supports allowlist for specific usernames
- 🧹 Cleans up downloaded files on startup

---

## 🚀 Getting Started

### 1. Clone

#### bash

```
git clone https://github.com/Takemyeye/NpmRunInstall_bot.git

cd NpmRunInstall_bot
```

### 2. Install Dependencies
```
npm install
```
#### 🏃‍♂️ Run the Bot
```
node bot.js
```
The bot will clean up any old audio files, start polling, and respond to messages.

#### 📦 Dependencies
node-telegram-bot-api

yt-search

yt-dlp — required installed globally

Install yt-dlp (if not already):
bash
Copy
Edit
brew install yt-dlp        


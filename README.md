# 🤖 WARREN-XMD

**WARREN-XMD** is a powerful, modular WhatsApp automation bot built with Node.js and Baileys. It features an advanced command handler, group management, media downloading, AI integrations, and automated tools.

---

## ✨ Features

- **Core System:** Automatic command discovery, error handling, auto-reconnection, and database persistence.
- **Security:** Owner permissions, private/public modes, anti-delete, anti-link, anti-call, and anti-status mention.
- **Media Downloads:** YouTube, TikTok, and Instagram.
- **AI & Search:** ChatGPT, weather, lyrics, and web screenshots.
- **Media Tools:** Sticker creation, sticker-to-image, view-once tools, and profile picture management.
- **Automation:** Auto-view status, auto-react, auto-bio, auto-reply, and auto-follow channel.
- **Group Management:** Kick, promote, demote, mute, unmute, tagall, link, and join.
- **Utilities:** Emoji animations, polls, and calculator.

---

## 📋 Requirements

Before installing WARREN-XMD, make sure you have:

- Node.js (LTS recommended)
- npm
- Git
- Python 3
- FFmpeg
- yt-dlp
- libvips (for image processing)

---

## 📦 Dependencies Installation

After cloning the repository, navigate into the project directory and install all Node.js dependencies:

```bash
npm install
```

This automatically installs the packages specified in `package.json`.

---

## 🚀 Installation Guide

### 1. Termux (Android)

Update Termux and install the required packages:

```bash
pkg update && pkg upgrade -y
pkg install git nodejs ffmpeg python libvips -y
pip install -U yt-dlp
```

Clone the repository:

```bash
git clone https://github.com/truelogic-lab/WhatsApp-Bot.git
cd WhatsApp-Bot
```

Install dependencies and start:

```bash
npm install
npm start
```

### 2. Windows

Install the following software:

- Node.js: https://nodejs.org/
- Git: https://git-scm.com/
- Python: https://www.python.org/
- FFmpeg: https://ffmpeg.org/

Make sure Python and FFmpeg are added to your system PATH.

Open Command Prompt:

```cmd
pip install -U yt-dlp

git clone https://github.com/truelogic-lab/WhatsApp-Bot.git
cd WhatsApp-Bot

npm install
npm start
```

### 3. Linux (Ubuntu/Debian VPS)

Update your system:

```bash
sudo apt update && sudo apt upgrade -y
```

Install system dependencies:

```bash
sudo apt install git nodejs npm ffmpeg python3 python3-pip libvips-dev -y
```

Install yt-dlp:

```bash
pip3 install -U yt-dlp
```

Clone the repository:

```bash
git clone https://github.com/truelogic-lab/WhatsApp-Bot.git
cd WhatsApp-Bot
```

Install dependencies and start:

```bash
npm install
npm start
```

---

## 🔗 WhatsApp Pairing

Follow these steps to connect your WhatsApp account:

1. Start WARREN-XMD using `npm start`.
2. Enter your WhatsApp number with the country code.
3. Do not include the `+` symbol.
4. Wait for the 8-digit pairing code.
5. Open WhatsApp on your phone.
6. Navigate to **Settings → Linked Devices**.
7. Select **Link a Device**.
8. Choose **Link with phone number instead**.
9. Enter the pairing code displayed in your terminal.

Once successfully paired, WARREN-XMD will connect and synchronize with WhatsApp.

---

## ⚙️ Configuration

| Setting | Description |
|---|---|
| Prefix | Default command prefix is `.` |
| Owner | Configured in `src/handlers/permissions.js` |
| Database | Settings stored in `data/database.json` |
| Session | WhatsApp authentication stored in `data/session/` |
| Mode | Supports private and public modes |

### Example Commands

```text
.mode public
.mode private
.prefix !
```

**Important:** Never share your WhatsApp session folder or upload authentication credentials to GitHub.

---

## 🖥️ 24/7 VPS Hosting

To keep WARREN-XMD running continuously on a Linux VPS, use PM2.

Install PM2:

```bash
npm install -g pm2
```

Start the bot:

```bash
pm2 start src/index.js --name WARREN-XMD
```

Save the process list:

```bash
pm2 save
pm2 startup
```

Useful PM2 commands:

```bash
pm2 status
pm2 logs WARREN-XMD
pm2 restart WARREN-XMD
pm2 stop WARREN-XMD
```

---

## 🛠️ Troubleshooting

### Bad MAC Errors

- Restart the bot.
- If authentication continues failing, back up and remove the session folder.
- Pair your WhatsApp account again.

### Sharp Installation Errors (Termux)

Try:

```bash
npm install --force @img/sharp-wasm32
npm install --force sharp
```

### YouTube Downloads Not Working

Check whether yt-dlp is installed:

```bash
yt-dlp --version
```

Update it:

```bash
pip install -U yt-dlp
```

### Bot Not Responding

- Check your internet connection.
- Confirm the bot is running.
- Check whether the bot is in private mode.
- Verify that your owner number is configured correctly.

---

## 📢 Official Channel

Follow **Kingdom of Code** for updates, announcements, support, and new features.

---

## 🛡️ Disclaimer

WARREN-XMD is provided for educational purposes. It uses the unofficial Baileys WhatsApp library. Unofficial WhatsApp automation may violate WhatsApp's Terms of Service and can result in account restrictions or bans.

Use this software responsibly. You are responsible for your deployment and usage. Avoid connecting your primary WhatsApp account.

---

## 👑 Credits

**Developer:** WARREN

**Bot Name:** WARREN-XMD

**Technology:** Node.js, Baileys

**Repository:** https://github.com/truelogic-lab/WhatsApp-Bot

**© 2026 WARREN-XMD. All rights reserved.**

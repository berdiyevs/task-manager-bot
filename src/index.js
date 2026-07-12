const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');
const db = require('./db');
const registerRouter = require('./bot/router');

async function main() {
  await db.initSchema(); // jadvallarni yaratadi (agar mavjud bo'lmasa)

  const bot = new TelegramBot(config.botToken, { polling: true });
  registerRouter(bot);

  process.on('SIGINT', () => {
    console.log('\nBot to‘xtatilmoqda...');
    bot.stopPolling().finally(() => process.exit(0));
  });

  console.log('✅ Bot ishga tushdi va xabarlarni kutmoqda...');
}

process.on('unhandledRejection', (err) => {
  console.error('Kutilmagan promise xatosi:', err);
});

main().catch((err) => {
  console.error('Botni ishga tushirishda xatolik:', err);
  process.exit(1);
});

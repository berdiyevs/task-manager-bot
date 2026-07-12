require('dotenv').config();

const config = {
  botToken: process.env.BOT_TOKEN,
  dbPath: process.env.DB_PATH || './data/database.sqlite',
};

if (!config.botToken) {
  console.error('XATOLIK: BOT_TOKEN topilmadi. .env faylini tekshiring (.env.example ga qarang).');
  process.exit(1);
}

module.exports = config;

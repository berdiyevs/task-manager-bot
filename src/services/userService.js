const db = require('../db');

/**
 * Foydalanuvchini bazaga yozadi; agar u allaqachon mavjud bo'lsa, ma'lumotlarini yangilaydi.
 */
async function registerUser(telegramUser) {
  await db.run(
    `INSERT INTO users (telegram_id, first_name, username)
     VALUES (?, ?, ?)
     ON CONFLICT(telegram_id) DO UPDATE SET
       first_name = excluded.first_name,
       username = excluded.username`,
    [telegramUser.id, telegramUser.first_name || null, telegramUser.username || null]
  );
}

async function getUser(telegramId) {
  return db.get('SELECT * FROM users WHERE telegram_id = ?', [telegramId]);
}

module.exports = { registerUser, getUser };

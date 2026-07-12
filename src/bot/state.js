/**
 * Har bir foydalanuvchi (chatId) uchun joriy suhbat holatini xotirada saqlaydi.
 * Bu faqat vaqtinchalik "hozir nima so'ralyapti" holati - doimiy ma'lumotlar
 * (vazifalarning o'zi) bazada saqlanadi.
 */
const sessions = new Map();

function getState(chatId) {
  return sessions.get(chatId) || null;
}

function setState(chatId, state) {
  sessions.set(chatId, state);
}

function clearState(chatId) {
  sessions.delete(chatId);
}

module.exports = { getState, setState, clearState };

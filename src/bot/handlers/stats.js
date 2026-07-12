const taskService = require('../../services/taskService');
const { mainMenuKeyboard } = require('../keyboards');

async function showStats(bot, chatId, userId) {
  try {
    const s = await taskService.getStats(userId);

    const text =
      `📊 <b>Sizning statistikangiz</b>\n\n` +
      `📌 Jami vazifalar: ${s.total}\n` +
      `🆕 Yangi: ${s.newCount}\n` +
      `⏳ Jarayonda: ${s.inProgressCount}\n` +
      `✅ Bajarilgan: ${s.doneCount}\n` +
      `🚫 Bekor qilingan: ${s.cancelledCount}\n` +
      `⚠️ Muddati o‘tgan: ${s.overdueCount}`;

    await bot.sendMessage(chatId, text, { parse_mode: 'HTML', ...mainMenuKeyboard() });
  } catch (err) {
    console.error('Statistikani olishda xatolik:', err);
    bot.sendMessage(chatId, '❌ Statistikani yuklashda xatolik yuz berdi.', mainMenuKeyboard());
  }
}

module.exports = { showStats };

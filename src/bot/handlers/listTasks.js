const taskService = require('../../services/taskService');
const { formatTaskListItem } = require('../utils/format');
const { taskListKeyboard, mainMenuKeyboard } = require('../keyboards');

async function showTaskList(bot, chatId, userId) {
  try {
    const tasks = await taskService.listTasksByUser(userId);

    if (tasks.length === 0) {
      return bot.sendMessage(chatId, 'Sizda hali vazifalar yo‘q. "➕ Yangi vazifa" tugmasi orqali qo‘shishingiz mumkin.', mainMenuKeyboard());
    }

    const text = `📋 Sizning vazifalaringiz (bajarish muddati bo‘yicha tartiblangan):\n\nBatafsil ko‘rish uchun vazifani tanlang 👇`;
    await bot.sendMessage(chatId, text, taskListKeyboard(tasks));
  } catch (err) {
    console.error('Vazifalar ro‘yxatini olishda xatolik:', err);
    bot.sendMessage(chatId, '❌ Vazifalarni yuklashda xatolik yuz berdi.', mainMenuKeyboard());
  }
}

async function handleBack(bot, query) {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  await bot.answerCallbackQuery(query.id);
  await bot.deleteMessage(chatId, query.message.message_id).catch(() => {});
  await showTaskList(bot, chatId, userId);
}

module.exports = { showTaskList, handleBack };

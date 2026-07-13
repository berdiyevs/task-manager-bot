const taskService = require('../../services/taskService');
const { taskListKeyboard, mainMenuKeyboard } = require('../keyboards');

/**
 * Vazifalar ro'yxatini (yoki qidiruv/filter natijasini) ko'rsatadi.
 * emptyText - natija bo'sh bo'lganda ko'rsatiladigan xabar.
 */
async function renderTaskList(bot, chatId, tasks, headerText, emptyText) {
  if (tasks.length === 0) {
    return bot.sendMessage(chatId, emptyText, mainMenuKeyboard());
  }
  await bot.sendMessage(chatId, headerText, taskListKeyboard(tasks));
}

async function showTaskList(bot, chatId, userId) {
  try {
    const tasks = await taskService.listTasksByUser(userId);
    await renderTaskList(
      bot,
      chatId,
      tasks,
      '📋 Sizning vazifalaringiz (bajarish muddati bo‘yicha tartiblangan):\n\nBatafsil ko‘rish uchun vazifani tanlang 👇',
      'Sizda hali vazifalar yo‘q. "➕ Yangi vazifa" tugmasi orqali qo‘shishingiz mumkin.'
    );
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

module.exports = { showTaskList, handleBack, renderTaskList };

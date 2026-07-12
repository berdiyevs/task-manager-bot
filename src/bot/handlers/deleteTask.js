const taskService = require('../../services/taskService');
const { deleteConfirmKeyboard, mainMenuKeyboard } = require('../keyboards');
const { parseTaskId, renderTaskDetail } = require('./taskDetail');

async function handleDeleteRequest(bot, query) {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const taskId = parseTaskId(query.data, 'task:delete:');
  const task = await taskService.getTaskById(userId, taskId);

  await bot.answerCallbackQuery(query.id);
  if (!task) {
    return bot.editMessageText('⚠️ Vazifa topilmadi.', { chat_id: chatId, message_id: query.message.message_id });
  }

  await bot.editMessageText('❗ Ushbu vazifani o‘chirishni tasdiqlaysizmi?', {
    chat_id: chatId,
    message_id: query.message.message_id,
    ...deleteConfirmKeyboard(taskId),
  });
}

async function handleConfirm(bot, query) {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  // data: task:delete:confirm:<id>
  const taskId = Number(query.data.split(':')[3]);

  try {
    const deleted = await taskService.deleteTask(userId, taskId);
    await bot.answerCallbackQuery(query.id, {
      text: deleted ? '🗑 Vazifa o‘chirildi.' : 'Vazifa topilmadi.',
    });
    await bot.editMessageText(
      deleted ? '🗑 Vazifa muvaffaqiyatli o‘chirildi.' : '⚠️ Vazifa topilmadi (ehtimol, allaqachon o‘chirilgan).',
      { chat_id: chatId, message_id: query.message.message_id }
    );
    await bot.sendMessage(chatId, 'Davom etishingiz mumkin 👇', mainMenuKeyboard());
  } catch (err) {
    console.error('Vazifani o‘chirishda xatolik:', err);
    bot.answerCallbackQuery(query.id, { text: 'Xatolik yuz berdi.' }).catch(() => {});
  }
}

async function handleCancel(bot, query) {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const taskId = Number(query.data.split(':')[3]);

  await bot.answerCallbackQuery(query.id, { text: 'Bekor qilindi.' });
  await renderTaskDetail(bot, chatId, query.message.message_id, userId, taskId);
}

module.exports = { handleDeleteRequest, handleConfirm, handleCancel };

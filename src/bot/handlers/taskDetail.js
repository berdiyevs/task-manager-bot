const taskService = require('../../services/taskService');
const { formatTaskDetail, statusLabel } = require('../utils/format');
const { taskDetailKeyboard, statusChoiceKeyboard } = require('../keyboards');

function parseTaskId(data, prefix) {
  return Number(data.slice(prefix.length));
}

async function renderTaskDetail(bot, chatId, messageId, userId, taskId) {
  const task = await taskService.getTaskById(userId, taskId);
  if (!task) {
    return bot.editMessageText('⚠️ Vazifa topilmadi (ehtimol, o‘chirilgan).', {
      chat_id: chatId,
      message_id: messageId,
    });
  }
  await bot.editMessageText(formatTaskDetail(task), {
    chat_id: chatId,
    message_id: messageId,
    parse_mode: 'HTML',
    ...taskDetailKeyboard(taskId),
  });
}

async function handleView(bot, query) {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const taskId = parseTaskId(query.data, 'task:view:');

  await bot.answerCallbackQuery(query.id);
  try {
    await renderTaskDetail(bot, chatId, query.message.message_id, userId, taskId);
  } catch (err) {
    console.error('Vazifa ko‘rsatishda xatolik:', err);
  }
}

async function handleStatusChoice(bot, query) {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const taskId = parseTaskId(query.data, 'task:status:');
  const task = await taskService.getTaskById(userId, taskId);

  await bot.answerCallbackQuery(query.id);
  if (!task) {
    return bot.editMessageText('⚠️ Vazifa topilmadi.', { chat_id: chatId, message_id: query.message.message_id });
  }

  await bot.editMessageText('🔄 Yangi statusni tanlang:', {
    chat_id: chatId,
    message_id: query.message.message_id,
    ...statusChoiceKeyboard(taskId),
  });
}

async function handleStatusSet(bot, query) {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  // data: task:status:set:<id>:<status>
  const parts = query.data.split(':');
  const taskId = Number(parts[3]);
  const status = parts[4];

  try {
    const updated = await taskService.updateTaskStatus(userId, taskId, status);
    if (!updated) {
      await bot.answerCallbackQuery(query.id, { text: 'Vazifa topilmadi.' });
      return;
    }
    await bot.answerCallbackQuery(query.id, { text: `✅ Vazifa statusi "${statusLabel(status)}" holatiga o‘zgartirildi.` });
    await renderTaskDetail(bot, chatId, query.message.message_id, userId, taskId);
  } catch (err) {
    console.error('Statusni yangilashda xatolik:', err);
    bot.answerCallbackQuery(query.id, { text: 'Xatolik yuz berdi.' }).catch(() => {});
  }
}

module.exports = { handleView, handleStatusChoice, handleStatusSet, renderTaskDetail, parseTaskId };

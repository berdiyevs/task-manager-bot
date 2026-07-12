const taskService = require('../../services/taskService');
const { setState, clearState } = require('../state');
const { editFieldKeyboard, editPriorityKeyboard, mainMenuKeyboard, taskDetailKeyboard } = require('../keyboards');
const { parseUserDate } = require('../utils/dateUtils');
const { formatTaskDetail } = require('../utils/format');
const { parseTaskId, renderTaskDetail } = require('./taskDetail');

const FIELD_QUESTIONS = {
  title: 'Yangi vazifa nomini kiriting:',
  description: 'Yangi tavsifni kiriting (tavsifni bo‘shatish uchun "-" yuboring):',
  due_date: 'Yangi bajarish muddatini kiriting (masalan: 15.07.2026 18:00):',
};

async function handleEditStart(bot, query) {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const taskId = parseTaskId(query.data, 'task:edit:');
  const task = await taskService.getTaskById(userId, taskId);

  await bot.answerCallbackQuery(query.id);
  if (!task) {
    return bot.editMessageText('⚠️ Vazifa topilmadi.', { chat_id: chatId, message_id: query.message.message_id });
  }

  await bot.editMessageText('✏️ Qaysi maydonni tahrirlashni xohlaysiz?', {
    chat_id: chatId,
    message_id: query.message.message_id,
    ...editFieldKeyboard(taskId),
  });
}

async function handleFieldChoice(bot, query) {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  // data: task:edit:field:<id>:<field>
  const parts = query.data.split(':');
  const taskId = Number(parts[3]);
  const field = parts[4];

  const task = await taskService.getTaskById(userId, taskId);
  await bot.answerCallbackQuery(query.id);
  if (!task) {
    return bot.editMessageText('⚠️ Vazifa topilmadi.', { chat_id: chatId, message_id: query.message.message_id });
  }

  if (field === 'priority') {
    return bot.editMessageText('🔥 Yangi muhimlik darajasini tanlang:', {
      chat_id: chatId,
      message_id: query.message.message_id,
      ...editPriorityKeyboard(taskId),
    });
  }

  setState(chatId, { flow: 'edit_task', taskId, field });
  await bot.editMessageText(FIELD_QUESTIONS[field], { chat_id: chatId, message_id: query.message.message_id });
}

async function handleSetPriority(bot, query) {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  // data: task:edit:setpriority:<id>:<priority>
  const parts = query.data.split(':');
  const taskId = Number(parts[3]);
  const priority = parts[4];

  try {
    const updated = await taskService.updateTaskField(userId, taskId, 'priority', priority);
    if (!updated) {
      await bot.answerCallbackQuery(query.id, { text: 'Vazifa topilmadi.' });
      return;
    }
    await bot.answerCallbackQuery(query.id, { text: '✅ Muhimlik darajasi yangilandi.' });
    await renderTaskDetail(bot, chatId, query.message.message_id, userId, taskId);
  } catch (err) {
    console.error('Muhimlikni yangilashda xatolik:', err);
    bot.answerCallbackQuery(query.id, { text: 'Xatolik yuz berdi.' }).catch(() => {});
  }
}

async function handleTextStep(bot, msg, state) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const { taskId, field } = state;
  const text = (msg.text || '').trim();

  let value = text;

  if (field === 'title' && !text) {
    return bot.sendMessage(chatId, 'Vazifa nomi bo‘sh bo‘lmasligi kerak. Qaytadan kiriting:');
  }

  if (field === 'description') {
    value = text === '-' ? null : text;
  }

  if (field === 'due_date') {
    const parsed = parseUserDate(text);
    if (!parsed) {
      return bot.sendMessage(
        chatId,
        '❌ Sana formati noto‘g‘ri. Iltimos, kun.oy.yil soat:daqiqa ko‘rinishida kiriting.\nMasalan: 15.07.2026 18:00'
      );
    }
    value = parsed;
  }

  try {
    const updated = await taskService.updateTaskField(userId, taskId, field, value);
    clearState(chatId);

    if (!updated) {
      return bot.sendMessage(chatId, '⚠️ Vazifa topilmadi (ehtimol, o‘chirilgan).', mainMenuKeyboard());
    }

    const task = await taskService.getTaskById(userId, taskId);
    await bot.sendMessage(chatId, '✅ Vazifa muvaffaqiyatli yangilandi.', mainMenuKeyboard());
    await bot.sendMessage(chatId, formatTaskDetail(task), {
      parse_mode: 'HTML',
      ...taskDetailKeyboard(taskId),
    });
  } catch (err) {
    console.error('Vazifani tahrirlashda xatolik:', err);
    clearState(chatId);
    bot.sendMessage(chatId, '❌ Yangilashda xatolik yuz berdi.', mainMenuKeyboard());
  }
}

module.exports = { handleEditStart, handleFieldChoice, handleSetPriority, handleTextStep };

const taskService = require('../../services/taskService');
const { setState, clearState, getState } = require('../state');
const { priorityKeyboard, mainMenuKeyboard, taskDetailKeyboard } = require('../keyboards');
const { parseUserDate } = require('../utils/dateUtils');
const { priorityLabel, formatTaskDetail } = require('../utils/format');

function startAddTask(bot, chatId) {
  setState(chatId, { flow: 'add_task', step: 'title', data: {} });
  bot.sendMessage(chatId, '📝 Yangi vazifa nomini kiriting:');
}

async function handleTextStep(bot, msg, state) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = (msg.text || '').trim();

  if (state.step === 'title') {
    if (!text) {
      return bot.sendMessage(chatId, 'Vazifa nomi bo‘sh bo‘lmasligi kerak. Qaytadan kiriting:');
    }
    state.data.title = text;
    state.step = 'description';
    setState(chatId, state);
    return bot.sendMessage(chatId, '📝 Endi vazifa tavsifini kiriting (agar tavsif kerak bo‘lmasa, "-" yuboring):');
  }

  if (state.step === 'description') {
    state.data.description = text === '-' ? null : text;
    state.step = 'priority';
    setState(chatId, state);
    return bot.sendMessage(chatId, '🔥 Muhimlik darajasini tanlang:', priorityKeyboard());
  }

  if (state.step === 'due_date') {
    const parsed = parseUserDate(text);
    if (!parsed) {
      return bot.sendMessage(
        chatId,
        '❌ Sana formati noto‘g‘ri. Iltimos, kun.oy.yil soat:daqiqa ko‘rinishida kiriting.\nMasalan: 15.07.2026 18:00'
      );
    }

    try {
      const taskId = await taskService.createTask({
        userId,
        title: state.data.title,
        description: state.data.description,
        priority: state.data.priority,
        dueDate: parsed,
      });
      clearState(chatId);

      const task = await taskService.getTaskById(userId, taskId);
      await bot.sendMessage(chatId, '✅ Vazifa muvaffaqiyatli qo‘shildi!', mainMenuKeyboard());
      await bot.sendMessage(chatId, formatTaskDetail(task), {
        parse_mode: 'HTML',
        ...taskDetailKeyboard(taskId),
      });
    } catch (err) {
      console.error('Vazifa yaratishda xatolik:', err);
      clearState(chatId);
      bot.sendMessage(chatId, '❌ Vazifani saqlashda xatolik yuz berdi. Qaytadan urinib ko‘ring.', mainMenuKeyboard());
    }
  }
}

async function handlePriorityCallback(bot, query) {
  const chatId = query.message.chat.id;
  const state = getState(chatId);

  if (!state || state.flow !== 'add_task' || state.step !== 'priority') {
    return bot.answerCallbackQuery(query.id, { text: 'Bu tugma endi faol emas.' });
  }

  const priority = query.data.split(':')[1];
  state.data.priority = priority;
  state.step = 'due_date';
  setState(chatId, state);

  await bot.answerCallbackQuery(query.id);
  await bot.editMessageText(`🔥 Muhimlik darajasi: ${priorityLabel(priority)} ✅`, {
    chat_id: chatId,
    message_id: query.message.message_id,
  });
  await bot.sendMessage(chatId, '⏰ Bajarish muddatini kiriting (masalan: 15.07.2026 18:00):');
}

module.exports = { startAddTask, handleTextStep, handlePriorityCallback };

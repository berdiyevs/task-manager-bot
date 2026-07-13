const taskService = require('../../services/taskService');
const { setState, clearState } = require('../state');
const {
  searchMenuKeyboard,
  searchStatusKeyboard,
  searchPriorityKeyboard,
  mainMenuKeyboard,
} = require('../keyboards');
const { statusLabel, priorityLabel } = require('../utils/format');
const { renderTaskList } = require('./listTasks');

async function showSearchMenu(bot, chatId) {
  clearState(chatId);
  await bot.sendMessage(chatId, '🔍 Qanday qidirmoqchisiz?', searchMenuKeyboard());
}

// --- Nomi bo'yicha qidiruv ---

async function handleNameSearchStart(bot, query) {
  const chatId = query.message.chat.id;
  await bot.answerCallbackQuery(query.id);
  setState(chatId, { flow: 'search_name', step: 'query' });
  await bot.editMessageText('🔤 Qidirmoqchi bo‘lgan vazifa nomini (yoki uning bir qismini) kiriting:', {
    chat_id: chatId,
    message_id: query.message.message_id,
  });
}

async function handleTextStep(bot, msg, state) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const query = (msg.text || '').trim();

  clearState(chatId);

  if (!query) {
    return bot.sendMessage(chatId, 'Qidiruv so‘zi bo‘sh bo‘lmasligi kerak.', mainMenuKeyboard());
  }

  try {
    const tasks = await taskService.searchTasksByName(userId, query);
    await renderTaskList(
      bot,
      chatId,
      tasks,
      `🔍 "${query}" bo‘yicha qidiruv natijalari:`,
      `😕 "${query}" bo‘yicha hech narsa topilmadi.`
    );
  } catch (err) {
    console.error('Nomi bo‘yicha qidirishda xatolik:', err);
    bot.sendMessage(chatId, '❌ Qidirishda xatolik yuz berdi.', mainMenuKeyboard());
  }
}

// --- Status bo'yicha filter ---

async function handleStatusMenu(bot, query) {
  const chatId = query.message.chat.id;
  await bot.answerCallbackQuery(query.id);
  await bot.editMessageText('📍 Qaysi status bo‘yicha filtrlaymiz?', {
    chat_id: chatId,
    message_id: query.message.message_id,
    ...searchStatusKeyboard(),
  });
}

async function handleStatusSet(bot, query) {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const status = query.data.split(':')[3]; // search:status:set:<status>

  await bot.answerCallbackQuery(query.id);
  try {
    const tasks = await taskService.filterTasksByStatus(userId, status);
    await bot.deleteMessage(chatId, query.message.message_id).catch(() => {});
    await renderTaskList(
      bot,
      chatId,
      tasks,
      `📍 Status: "${statusLabel(status)}" bo‘yicha natijalar:`,
      `😕 "${statusLabel(status)}" statusidagi vazifalar topilmadi.`
    );
  } catch (err) {
    console.error('Status bo‘yicha filtrlashda xatolik:', err);
    bot.sendMessage(chatId, '❌ Filtrlashda xatolik yuz berdi.', mainMenuKeyboard());
  }
}

// --- Muhimlik darajasi bo'yicha filter ---

async function handlePriorityMenu(bot, query) {
  const chatId = query.message.chat.id;
  await bot.answerCallbackQuery(query.id);
  await bot.editMessageText('🔥 Qaysi muhimlik darajasi bo‘yicha filtrlaymiz?', {
    chat_id: chatId,
    message_id: query.message.message_id,
    ...searchPriorityKeyboard(),
  });
}

async function handlePrioritySet(bot, query) {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const priority = query.data.split(':')[3]; // search:priority:set:<priority>

  await bot.answerCallbackQuery(query.id);
  try {
    const tasks = await taskService.filterTasksByPriority(userId, priority);
    await bot.deleteMessage(chatId, query.message.message_id).catch(() => {});
    await renderTaskList(
      bot,
      chatId,
      tasks,
      `🔥 Muhimlik: "${priorityLabel(priority)}" bo‘yicha natijalar:`,
      `😕 "${priorityLabel(priority)}" muhimlikdagi vazifalar topilmadi.`
    );
  } catch (err) {
    console.error('Muhimlik bo‘yicha filtrlashda xatolik:', err);
    bot.sendMessage(chatId, '❌ Filtrlashda xatolik yuz berdi.', mainMenuKeyboard());
  }
}

// --- Orqaga (qidiruv menyusiga) ---

async function handleBack(bot, query) {
  const chatId = query.message.chat.id;
  await bot.answerCallbackQuery(query.id);
  await bot.editMessageText('🔍 Qanday qidirmoqchisiz?', {
    chat_id: chatId,
    message_id: query.message.message_id,
    ...searchMenuKeyboard(),
  });
}

module.exports = {
  showSearchMenu,
  handleNameSearchStart,
  handleTextStep,
  handleStatusMenu,
  handleStatusSet,
  handlePriorityMenu,
  handlePrioritySet,
  handleBack,
};

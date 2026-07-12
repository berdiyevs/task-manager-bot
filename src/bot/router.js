const userService = require('../services/userService');
const { getState, clearState } = require('./state');
const { mainMenuKeyboard } = require('./keyboards');

const registerStartHandler = require('./handlers/start');
const addTask = require('./handlers/addTask');
const listTasks = require('./handlers/listTasks');
const taskDetail = require('./handlers/taskDetail');
const editTask = require('./handlers/editTask');
const deleteTask = require('./handlers/deleteTask');
const stats = require('./handlers/stats');

// Asosiy menyu tugmalari - bular har doim ustunlik qiladi, hatto foydalanuvchi
// biror jarayon (masalan, vazifa qo'shish) o'rtasida bo'lsa ham.
const MENU_ACTIONS = {
  '➕ Yangi vazifa': (bot, chatId, userId) => addTask.startAddTask(bot, chatId),
  '📋 Vazifalar': (bot, chatId, userId) => listTasks.showTaskList(bot, chatId, userId),
  '📊 Statistika': (bot, chatId, userId) => stats.showStats(bot, chatId, userId),
};

function registerRouter(bot) {
  registerStartHandler(bot);

  // --- Matnli xabarlar (menyu tugmalari va bosqichma-bosqich kiritiladigan ma'lumotlar) ---
  bot.on('message', async (msg) => {
    if (!msg.text || msg.text.startsWith('/')) return;

    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Foydalanuvchi bazada mavjudligiga ishonch hosil qilamiz (masalan, /start bosilmagan bo'lsa ham)
    try {
      await userService.registerUser(msg.from);
    } catch (err) {
      console.error('Foydalanuvchini ro‘yxatdan o‘tkazishda xatolik:', err);
    }

    const state = getState(chatId);
    const menuAction = MENU_ACTIONS[msg.text];

    try {
      // Menyu tugmasi bosilgan bo'lsa, joriy jarayon (agar mavjud bo'lsa) bekor qilinadi
      // va menyu amali bajariladi. Shu orqali tugma bosish vazifa matni sifatida yozilib qolmaydi.
      if (menuAction) {
        if (state) {
          clearState(chatId);
          await bot.sendMessage(chatId, '↩️ Joriy amal bekor qilindi.');
        }
        return await menuAction(bot, chatId, userId);
      }

      if (state && state.flow === 'add_task') {
        return await addTask.handleTextStep(bot, msg, state);
      }
      if (state && state.flow === 'edit_task') {
        return await editTask.handleTextStep(bot, msg, state);
      }

      return bot.sendMessage(chatId, 'Iltimos, quyidagi menyudan birini tanlang 👇', mainMenuKeyboard());
    } catch (err) {
      console.error('Xabarni qayta ishlashda xatolik:', err);
      bot.sendMessage(chatId, '❌ Kutilmagan xatolik yuz berdi. Qaytadan urinib ko‘ring.', mainMenuKeyboard());
    }
  });

  // --- Inline tugmalar (callback query) ---
  bot.on('callback_query', async (query) => {
    const data = query.data || '';

    try {
      if (data.startsWith('priority:')) return await addTask.handlePriorityCallback(bot, query);

      if (data.startsWith('task:status:set:')) return await taskDetail.handleStatusSet(bot, query);
      if (data.startsWith('task:status:')) return await taskDetail.handleStatusChoice(bot, query);

      if (data.startsWith('task:edit:setpriority:')) return await editTask.handleSetPriority(bot, query);
      if (data.startsWith('task:edit:field:')) return await editTask.handleFieldChoice(bot, query);
      if (data.startsWith('task:edit:')) return await editTask.handleEditStart(bot, query);

      if (data.startsWith('task:delete:confirm:')) return await deleteTask.handleConfirm(bot, query);
      if (data.startsWith('task:delete:cancel:')) return await deleteTask.handleCancel(bot, query);
      if (data.startsWith('task:delete:')) return await deleteTask.handleDeleteRequest(bot, query);

      if (data.startsWith('task:view:')) return await taskDetail.handleView(bot, query);
      if (data === 'task:back') return await listTasks.handleBack(bot, query);

      // Noma'lum callback - hech bo'lmasa "loading" holatini to'xtatamiz
      await bot.answerCallbackQuery(query.id);
    } catch (err) {
      console.error('Callback query qayta ishlashda xatolik:', err);
      bot.answerCallbackQuery(query.id, { text: '❌ Xatolik yuz berdi.' }).catch(() => {});
    }
  });

  // Bot darajasidagi umumiy xatoliklarni ushlab qolish (polling xatoliklari va h.k.)
  bot.on('polling_error', (err) => {
    console.error('Polling xatosi:', err.message);
  });
}

module.exports = registerRouter;

const userService = require('../../services/userService');
const { mainMenuKeyboard } = require('../keyboards');
const { clearState } = require('../state');

function registerStartHandler(bot) {
  bot.onText(/^\/start$/, async (msg) => {
    const chatId = msg.chat.id;
    try {
      await userService.registerUser(msg.from);
      clearState(chatId);

      const text =
        `👋 Salom, ${msg.from.first_name || 'do‘stim'}!\n\n` +
        `Men — shaxsiy vazifalaringizni boshqarishga yordam beruvchi botman.\n\n` +
        `Men bilan siz:\n` +
        `➕ Yangi vazifa qo‘sha olasiz\n` +
        `📋 Barcha vazifalaringizni ko‘ra olasiz\n` +
        `🔄 Status va ma’lumotlarni tahrirlay olasiz\n` +
        `📊 Statistikangizni kuzata olasiz\n\n` +
        `Quyidagi menyudan boshlang 👇`;

      bot.sendMessage(chatId, text, mainMenuKeyboard());
    } catch (err) {
      console.error('start handler xatosi:', err);
      bot.sendMessage(chatId, '❌ Xatolik yuz berdi. Birozdan so‘ng qayta urinib ko‘ring.');
    }
  });
}

module.exports = registerStartHandler;

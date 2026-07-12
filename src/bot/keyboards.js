const { priorityLabel, statusLabel } = require('./utils/format');

function mainMenuKeyboard() {
  return {
    reply_markup: {
      keyboard: [['➕ Yangi vazifa'], ['📋 Vazifalar', '📊 Statistika']],
      resize_keyboard: true,
    },
  };
}

function priorityKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Past', callback_data: 'priority:low' },
          { text: "O'rta", callback_data: 'priority:medium' },
          { text: 'Yuqori', callback_data: 'priority:high' },
        ],
      ],
    },
  };
}

function taskListKeyboard(tasks) {
  const rows = tasks.map((t) => [
    { text: `#${t.id} ${t.title}`, callback_data: `task:view:${t.id}` },
  ]);
  return { reply_markup: { inline_keyboard: rows } };
}

function taskDetailKeyboard(taskId) {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🔄 Statusni o‘zgartirish', callback_data: `task:status:${taskId}` }],
        [{ text: '✏️ Tahrirlash', callback_data: `task:edit:${taskId}` }],
        [{ text: '🗑 O‘chirish', callback_data: `task:delete:${taskId}` }],
        [{ text: '⬅️ Orqaga', callback_data: 'task:back' }],
      ],
    },
  };
}

const STATUS_VALUES = ['new', 'in_progress', 'done', 'cancelled'];

function statusChoiceKeyboard(taskId) {
  const rows = STATUS_VALUES.map((s) => [
    { text: statusLabel(s), callback_data: `task:status:set:${taskId}:${s}` },
  ]);
  rows.push([{ text: '⬅️ Orqaga', callback_data: `task:view:${taskId}` }]);
  return { reply_markup: { inline_keyboard: rows } };
}

function editFieldKeyboard(taskId) {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Vazifa nomi', callback_data: `task:edit:field:${taskId}:title` }],
        [{ text: 'Tavsifi', callback_data: `task:edit:field:${taskId}:description` }],
        [{ text: 'Muhimlik darajasi', callback_data: `task:edit:field:${taskId}:priority` }],
        [{ text: 'Bajarish muddati', callback_data: `task:edit:field:${taskId}:due_date` }],
        [{ text: '⬅️ Orqaga', callback_data: `task:view:${taskId}` }],
      ],
    },
  };
}

function editPriorityKeyboard(taskId) {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Past', callback_data: `task:edit:setpriority:${taskId}:low` },
          { text: "O'rta", callback_data: `task:edit:setpriority:${taskId}:medium` },
          { text: 'Yuqori', callback_data: `task:edit:setpriority:${taskId}:high` },
        ],
      ],
    },
  };
}

function deleteConfirmKeyboard(taskId) {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Ha, o‘chirish', callback_data: `task:delete:confirm:${taskId}` },
          { text: 'Yo‘q, bekor qilish', callback_data: `task:delete:cancel:${taskId}` },
        ],
      ],
    },
  };
}

module.exports = {
  mainMenuKeyboard,
  priorityKeyboard,
  taskListKeyboard,
  taskDetailKeyboard,
  statusChoiceKeyboard,
  editFieldKeyboard,
  editPriorityKeyboard,
  deleteConfirmKeyboard,
};

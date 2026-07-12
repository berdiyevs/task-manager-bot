const { formatForDisplay } = require('./dateUtils');

const PRIORITY_LABELS = {
  low: 'Past',
  medium: "O'rta",
  high: 'Yuqori',
};

const STATUS_LABELS = {
  new: 'Yangi',
  in_progress: 'Jarayonda',
  done: 'Bajarildi',
  cancelled: 'Bekor qilindi',
};

function priorityLabel(value) {
  return PRIORITY_LABELS[value] || value;
}

function statusLabel(value) {
  return STATUS_LABELS[value] || value;
}

function isOverdue(task) {
  if (task.status === 'done' || task.status === 'cancelled') return false;
  return new Date(task.due_date.replace(' ', 'T')) < new Date();
}

/**
 * Vazifalar ro'yxatidagi bitta qatorni formatlaydi.
 */
function formatTaskListItem(task) {
  const overdueMark = isOverdue(task) ? ' ⚠️ muddati o‘tgan' : '';
  return (
    `#${task.id} ${task.title}\n` +
    `   ${priorityLabel(task.priority)} | ${statusLabel(task.status)} | ⏰ ${formatForDisplay(task.due_date)}${overdueMark}`
  );
}

/**
 * Vazifa haqida to'liq ma'lumotni formatlaydi.
 */
function formatTaskDetail(task) {
  const overdueMark = isOverdue(task) ? '\n⚠️ Ushbu vazifaning muddati o‘tib ketgan!' : '';
  return (
    `📌 <b>${escapeHtml(task.title)}</b>\n\n` +
    `📝 Tavsif: ${task.description ? escapeHtml(task.description) : '—'}\n` +
    `🔥 Muhimlik: ${priorityLabel(task.priority)}\n` +
    `📍 Status: ${statusLabel(task.status)}\n` +
    `⏰ Bajarish muddati: ${formatForDisplay(task.due_date)}\n` +
    `🕓 Yaratilgan: ${formatForDisplay(task.created_at)}` +
    overdueMark
  );
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

module.exports = {
  PRIORITY_LABELS,
  STATUS_LABELS,
  priorityLabel,
  statusLabel,
  isOverdue,
  formatTaskListItem,
  formatTaskDetail,
  escapeHtml,
};

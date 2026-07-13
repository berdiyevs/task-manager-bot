const db = require('../db');

/**
 * Yangi vazifa yaratadi. Status har doim 'new' bo'ladi. Yangi vazifaning ID'sini qaytaradi.
 */
async function createTask({ userId, title, description, priority, dueDate }) {
  const result = await db.run(
    `INSERT INTO tasks (user_id, title, description, priority, status, due_date)
     VALUES (?, ?, ?, ?, 'new', ?)`,
    [userId, title, description, priority, dueDate]
  );
  return result.lastID;
}

/**
 * Foydalanuvchining barcha vazifalarini bajarish muddati bo'yicha tartiblab qaytaradi
 * (eng yaqin muddat birinchi).
 */
async function listTasksByUser(userId) {
  return db.all('SELECT * FROM tasks WHERE user_id = ? ORDER BY due_date ASC', [userId]);
}

/**
 * Bitta vazifani ID bo'yicha oladi, lekin faqat shu foydalanuvchiga tegishli bo'lsagina.
 * Bu boshqa foydalanuvchi vazifasini ko'rish/o'zgartirishning oldini oladi.
 */
async function getTaskById(userId, taskId) {
  return db.get('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [taskId, userId]);
}

async function updateTaskStatus(userId, taskId, status) {
  const result = await db.run(
    'UPDATE tasks SET status = ? WHERE id = ? AND user_id = ?',
    [status, taskId, userId]
  );
  return result.changes > 0;
}

/**
 * Vazifaning bitta maydonini yangilaydi. field faqat oldindan belgilangan
 * ro'yxatdan bo'lishi mumkin (SQL injection'dan himoya).
 */
const EDITABLE_FIELDS = new Set(['title', 'description', 'priority', 'due_date']);

async function updateTaskField(userId, taskId, field, value) {
  if (!EDITABLE_FIELDS.has(field)) {
    throw new Error(`Noto'g'ri maydon nomi: ${field}`);
  }
  const result = await db.run(
    `UPDATE tasks SET ${field} = ? WHERE id = ? AND user_id = ?`,
    [value, taskId, userId]
  );
  return result.changes > 0;
}

async function deleteTask(userId, taskId) {
  const result = await db.run('DELETE FROM tasks WHERE id = ? AND user_id = ?', [taskId, userId]);
  return result.changes > 0;
}

/**
 * Vazifa nomi bo'yicha qidiradi (katta-kichik harfga sezgir emas, qisman moslik ham topiladi).
 */
async function searchTasksByName(userId, query) {
  return db.all(
    'SELECT * FROM tasks WHERE user_id = ? AND title LIKE ? ORDER BY due_date ASC',
    [userId, `%${query}%`]
  );
}

/**
 * Status bo'yicha filtrlaydi.
 */
async function filterTasksByStatus(userId, status) {
  return db.all(
    'SELECT * FROM tasks WHERE user_id = ? AND status = ? ORDER BY due_date ASC',
    [userId, status]
  );
}

/**
 * Muhimlik darajasi bo'yicha filtrlaydi.
 */
async function filterTasksByPriority(userId, priority) {
  return db.all(
    'SELECT * FROM tasks WHERE user_id = ? AND priority = ? ORDER BY due_date ASC',
    [userId, priority]
  );
}

/**
 * Foydalanuvchi uchun statistika hisoblaydi.
 */
async function getStats(userId) {
  const row = await db.get(
    `SELECT
       COUNT(*) AS total,
       SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) AS newCount,
       SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS inProgressCount,
       SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS doneCount,
       SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelledCount,
       SUM(CASE WHEN due_date < datetime('now') AND status NOT IN ('done', 'cancelled') THEN 1 ELSE 0 END) AS overdueCount
     FROM tasks WHERE user_id = ?`,
    [userId]
  );

  return {
    total: row.total || 0,
    newCount: row.newCount || 0,
    inProgressCount: row.inProgressCount || 0,
    doneCount: row.doneCount || 0,
    cancelledCount: row.cancelledCount || 0,
    overdueCount: row.overdueCount || 0,
  };
}

module.exports = {
  createTask,
  listTasksByUser,
  getTaskById,
  updateTaskStatus,
  updateTaskField,
  deleteTask,
  getStats,
  searchTasksByName,
  filterTasksByStatus,
  filterTasksByPriority,
};

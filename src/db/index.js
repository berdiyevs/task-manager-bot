const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const config = require('../config');

// Baza fayli joylashadigan papkani yaratib qo'yamiz (agar mavjud bo'lmasa)
const dbDir = path.dirname(config.dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const rawDb = new sqlite3.Database(config.dbPath);
rawDb.run('PRAGMA foreign_keys = ON');

/**
 * sqlite3 callback-based API'ni Promise'ga o'giruvchi yordamchi funksiyalar.
 * run  - INSERT/UPDATE/DELETE/DDL uchun ({ lastID, changes } qaytaradi)
 * get  - bitta qator qaytaradi (yoki undefined)
 * all  - qatorlar massivini qaytaradi
 * exec - bir nechta SQL buyrug'ini ketma-ket bajaradi (natija qaytarmaydi)
 */
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    rawDb.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    rawDb.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    rawDb.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function exec(sql) {
  return new Promise((resolve, reject) => {
    rawDb.exec(sql, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

/**
 * Jadvallarni yaratadi (agar mavjud bo'lmasa). index.js ishga tushganda bir marta chaqiriladi.
 */
async function initSchema() {
  await exec(`
    CREATE TABLE IF NOT EXISTS users (
      telegram_id INTEGER PRIMARY KEY,
      first_name  TEXT,
      username    TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL,
      title       TEXT NOT NULL,
      description TEXT,
      priority    TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
      status      TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'done', 'cancelled')),
      due_date    TEXT NOT NULL,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users (telegram_id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks (user_id);
  `);
}

module.exports = { run, get, all, exec, initSchema, rawDb };

const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');

dayjs.extend(customParseFormat);

const INPUT_FORMAT = 'DD.MM.YYYY HH:mm';
const DB_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const DISPLAY_FORMAT = 'DD.MM.YYYY HH:mm';

const DATE_REGEX = /^(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})$/;

/**
 * Foydalanuvchi kiritgan "15.07.2026 18:00" formatidagi matnni tekshiradi
 * va bazaga saqlash uchun ISO-ga o'xshash formatga o'giradi.
 * Noto'g'ri bo'lsa null qaytaradi.
 */
function parseUserDate(text) {
  if (!text || !DATE_REGEX.test(text.trim())) {
    return null;
  }
  const parsed = dayjs(text.trim(), INPUT_FORMAT, true);
  if (!parsed.isValid()) {
    return null;
  }
  return parsed.format(DB_FORMAT);
}

/**
 * Bazadagi sanani foydalanuvchiga ko'rsatish uchun formatlaydi.
 */
function formatForDisplay(dbDateString) {
  return dayjs(dbDateString).format(DISPLAY_FORMAT);
}

module.exports = { parseUserDate, formatForDisplay, INPUT_FORMAT };

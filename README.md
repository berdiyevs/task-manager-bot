# Mini Task Manager Telegram Bot

Telegram orqali shaxsiy vazifalarni boshqarish uchun bot. Foydalanuvchi vazifa qo‘sha oladi, ro‘yxatini ko‘ra oladi, statusini o‘zgartira oladi, tahrirlay oladi, o‘chira oladi va statistikasini ko‘ra oladi. Har bir foydalanuvchi faqat o‘z vazifalarini ko‘radi.

## Ishlatilgan texnologiyalar

- **Node.js** (v18+)
- **node-telegram-bot-api** — Telegram Bot API bilan ishlash (long polling)
- **sqlite3** — SQLite baza bilan ishlash (asinxron, callback-based; `src/db/index.js` da Promise'ga o'ralgan)
- **dayjs** — sanalarni parsing/formatlash
- **dotenv** — maxfiy ma'lumotlarni `.env` faylida saqlash

## Ishga tushirish (Local)

1. Repository'ni clone qiling va papkaga kiring:
   ```bash
   git clone https://github.com/berdiyevs/task-manager-bot.git
   cd task-manager-bot
   

2. Kerakli paketlarni o‘rnating:
```bash
npm install

```


3. `.env.example` faylidan nusxa oling va o‘z bot tokeningizni kiriting (token @BotFather orqali olinadi):
```bash
cp .env.example .env

```


`.env` faylini oching va `BOT_TOKEN` qiymatini o‘zgartiring.
4. Botni ishga tushiring:
```bash
npm start

```


Baza fayli avtomatik ravishda `data/database.sqlite` yo‘lida yaratiladi (papka mavjud bo‘lmasa, o‘zi yaratiladi).

## Deployment (Azure Cloud)

Ushbu bot **Microsoft Azure** platformasidagi Virtual Mashinaga (Ubuntu Server) muvaffaqiyatli joylashtirilgan va fonda (**background**) 24/7 rejimda to'xtovsiz ishlaydi.

### Ishga tushirish jarayoni (Process Management)

Loyihani serverda doimiy, barqaror va xavfsiz ishlatish uchun quyidagi ketma-ketlikdan foydalanildi:

1. **SSH ulanish:** Azure virtual mashinasiga xavfsiz SSH protokoli orqali ulanish o'rnatildi.
2. **Muhitni sozlash:** Server tizimi yangilandi, unga `Node.js`, `npm` va loyiha ishlashi uchun kerakli barcha paketlar o'rnatildi.
3. **Konfiguratsiya:** Maxfiy o'zgaruvchilar va bot tokenlari `.env` fayli orqali xavfsiz tarzda muhitga kiritildi.
4. **PM2 (Process Manager):** Bot terminal yopilganda o'chib qolmasligi hamda server qandaydir sabab bilan qayta yuklanganda (**reboot**) avtomatik ishga tushishi uchun **PM2** dasturi bilan integratsiya qilindi:
* Botni PM2 orqali fon rejimida yoqish:
```bash
pm2 start src/index.js --name "task-manager-bot"

```


* Tizimga auto-boot skriptini kiritish:
```bash
pm2 startup

```


* Joriy jarayonlar ro'yxatini xotiraga saqlab qo'yish:
```bash
pm2 save

```





### Loyihani yangilash va texnik xizmat (Maintenance)

Kodga o'zgartirish kiritilganda, serverdagi botni yangilash algoritmi juda oddiy:

```bash
git pull origin main
pm2 restart task-manager-bot

```

## Loyiha strukturasi

```
task-manager-bot/
├── src/
│   ├── index.js              # Kirish nuqtasi - botni ishga tushiradi
│   ├── config.js             # .env dan sozlamalarni o'qiydi
│   ├── db/
│   │   └── index.js          # SQLite (sqlite3) ulanishi, Promise wrapper va jadval sxemasi
│   ├── services/
│   │   ├── userService.js    # Foydalanuvchilar bilan ishlash (DB)
│   │   └── taskService.js    # Vazifalar bilan ishlash (DB, CRUD + statistika)
│   └── bot/
│       ├── router.js         # Barcha xabar/tugma bosishlarni tegishli handler'ga yo'naltiradi
│       ├── state.js          # Foydalanuvchining joriy suhbat holati (xotirada)
│       ├── keyboards.js      # Inline va reply klaviaturalar
│       ├── handlers/
│       │   ├── start.js      # /start buyrug'i
│       │   ├── addTask.js    # Yangi vazifa qo'shish (bosqichma-bosqich)
│       │   ├── listTasks.js  # Vazifalar ro'yxati
│       │   ├── taskDetail.js # Vazifa tafsilotlari + status o'zgartirish
│       │   ├── editTask.js   # Vazifani tahrirlash
│       │   ├── deleteTask.js # Vazifani o'chirish (tasdiqlash bilan)
│       │   └── stats.js      # Statistika
│       └── utils/
│           ├── dateUtils.js  # Sana parsing/formatlash (DD.MM.YYYY HH:mm)
│           └── format.js     # Matnlarni formatlash, label'lar
├── .env.example
├── .gitignore
├── package.json
└── README.md

```

## Ma'lumotlar bazasi strukturasi

**users**

| Ustun | Turi | Izoh |
| --- | --- | --- |
| telegram_id | INTEGER | Primary key (Telegram user ID) |
| first_name | TEXT |  |
| username | TEXT |  |
| created_at | TEXT | Avtomatik to'ldiriladi |

**tasks**

| Ustun | Turi | Izoh |
| --- | --- | --- |
| id | INTEGER | Primary key, autoincrement |
| user_id | INTEGER | `users.telegram_id` ga bog'langan (foreign key) |
| title | TEXT | Vazifa nomi |
| description | TEXT | Vazifa tavsifi (bo'sh bo'lishi mumkin) |
| priority | TEXT | `low` / `medium` / `high` |
| status | TEXT | `new` / `in_progress` / `done` / `cancelled` |
| due_date | TEXT | Bajarish muddati (`YYYY-MM-DD HH:mm:ss`) |
| created_at | TEXT | Yaratilgan vaqt, avtomatik to'ldiriladi |

Har bir so'rovda `user_id` bo'yicha filtr qo'llaniladi — shu orqali foydalanuvchilar bir-birining vazifalarini ko'ra olmaydi.

## Botning asosiy imkoniyatlari

* `/start` — ro'yxatdan o'tish va asosiy menyu
* ➕ Yangi vazifa qo'shish (nomi → tavsifi → muhimlik darajasi → muddati, bosqichma-bosqich)
* 📋 Vazifalar ro'yxati (bajarish muddati bo'yicha tartiblangan, eng yaqini birinchi)
* Vazifa tafsilotlarini ko'rish
* 🔄 Statusni o'zgartirish (Yangi / Jarayonda / Bajarildi / Bekor qilindi)
* ✏️ Vazifani tahrirlash (nomi, tavsifi, muhimlik darajasi, muddati — alohida-alohida)
* 🗑 Vazifani o'chirish (tasdiqlash so'ralgan holda)
* 📊 Statistika (jami, status bo'yicha va muddati o'tgan vazifalar soni)
* Noto'g'ri sana formati kiritilganda tushunarli xato xabari
* Xatolarni qayta ishlash (try/catch, foydalanuvchiga tushunarli xabar)

## Bajarilmagan yoki yaxshilanishi mumkin bo'lgan qismlar

* Pagination (vazifalar soni ko'p bo'lganda sahifalash)
* Muddati o'tgan vazifalarni alohida ro'yxatda ko'rsatish
* Eslatma/bildirishnoma yuborish (muddat yaqinlashganda)
* Logging (fayl darajasida)
* Unit testlar
* PostgreSQL va migratsiyalar (o'rniga SQLite ishlatildi, texnik talablarda ruxsat berilgan)

Ushbu qismlar keyingi bosqichda, asosiy funksionallik tasdiqlangandan so'ng qo'shilishi mumkin.

## Foydalanilgan suhbat holati (state) haqida eslatma

Ko'p bosqichli formalar (vazifa qo'shish, tahrirlash) uchun foydalanuvchining "hozir nima kiritilyapti" holati xotirada (`Map` orqali) saqlanadi, chunki bu vaqtinchalik ma'lumot va bot qayta ishga tushganda yo'qolishi muammo emas. Vazifalarning o'zi doim SQLite bazasida saqlanadi.

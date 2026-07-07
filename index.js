// @ts-nocheck
const tmi = require('tmi.js');
const fs = require('fs');
const http = require('http');

const handleCommands = require('./commands.js'); 

// ОБМАНКА ДЛЯ RENDER
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Твій бот працює!');
}).listen(process.env.PORT || 3000);

const BOT_USERNAME = 'r0masik_bot'; 
const OAUTH_TOKEN = 'oauth:v8wefxwrmrp9aee3774ogexiijsl6l'; 
const CHANNEL_NAME = 'r0masik_'; 

// Завантаження бази
let db = {};
if (fs.existsSync('db.json')) {
    db = JSON.parse(fs.readFileSync('db.json', 'utf8'));
}

function saveDb() {
    fs.writeFileSync('db.json', JSON.stringify(db, null, 2));
}

const client = new tmi.Client({
    identity: { username: BOT_USERNAME, password: OAUTH_TOKEN },
    channels: [ CHANNEL_NAME ]
});

client.connect().catch(console.error);

// ==========================================
// ⏱️ АВТОР-НАРАХУВАННЯ ЗА ЧАС
// ==========================================
const INTERVAL_MINUTES = 2;      // Кожні скільки хвилин нараховувати
const POINTS_PER_INTERVAL = 15;  // Скільки балів давати

// Список тих, хто засвітився на стрімі
const activeViewers = new Set();

setInterval(() => {
    if (activeViewers.size > 0) {
        activeViewers.forEach(viewer => {
            if (!db[viewer]) db[viewer] = 0;
            db[viewer] += POINTS_PER_INTERVAL;
        });
        saveDb();
        console.log(`Нараховано по ${POINTS_PER_INTERVAL} балів за ${INTERVAL_MINUTES} хв!`);
    }
}, INTERVAL_MINUTES * 60 * 1000);
// ==========================================

client.on('message', async (channel, tags, message, self) => {
    if (self) return;
    const sender = tags.username;
    const args = message.trim().split(' ');
    const command = args[0].toLowerCase();

    // Як тільки людина щось написала - бот розуміє, що вона на стрімі, і починає сипати бали за час
    activeViewers.add(sender);

    // Передаємо логіку команд у commands.js
    handleCommands(client, channel, tags, message, command, args, db, saveDb, sender);
});

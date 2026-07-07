// @ts-nocheck
const tmi = require('tmi.js');
const fs = require('fs');
const http = require('http');

// Підключаємо наш файл із командами
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

client.on('message', async (channel, tags, message, self) => {
    if (self) return;
    const sender = tags.username;
    const args = message.trim().split(' ');
    const command = args[0].toLowerCase();

    // Запис балів за активність (тихий)
    if (!db[sender]) db[sender] = 0;
    db[sender] += 1;
    saveDb();

    // Передаємо всі дані у файл commands.js, щоб команди виконувалися там
    handleCommands(client, channel, tags, message, command, args, db, saveDb, sender);
});

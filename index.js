// @ts-nocheck
const tmi = require('tmi.js');
const fs = require('fs');
const http = require('http');

// 1. ЗАВАНТАЖУЄМО БАЗУ НА САМОМУ ПОЧАТКУ
let db = fs.existsSync('db.json') ? JSON.parse(fs.readFileSync('db.json', 'utf8')) : {};
function saveDb() { fs.writeFileSync('db.json', JSON.stringify(db, null, 2)); }

// 2. ВЕБ-СЕРВЕР, ЯКИЙ ПОКАЗУЄ ТОБІ СПИСОК БАЛІВ
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    // Виводить всю базу db на екран!
    res.end(JSON.stringify(db, null, 2));
}).listen(process.env.PORT || 3000);

// 3. ПІДКЛЮЧЕННЯ ДО ТВІЧА
const client = new tmi.Client({
    identity: { username: 'r0masik_bot', password: 'oauth:v8wefxwrmrp9aee3774ogexiijsl6l' },
    channels: [ 'r0masik_' ]
});

client.connect().catch(console.error);

client.on('message', async (channel, tags, message, self) => {
    if (self) return;
    const sender = tags.username;
    const args = message.trim().split(' ');
    const command = args[0].toLowerCase();
    const isMod = tags.mod || (tags.badges && tags.badges.broadcaster === '1');

    // АВТО-НАРАХУВАННЯ
    if (!message.startsWith('!')) {
        if (!db[sender]) db[sender] = 0;
        db[sender] += 1;
        saveDb();
    }

    // СИСТЕМНІ КОМАНДИ 
    if (['!бали', '!рулетка', '!топ', '!дати', '!розіграш', '!го', '!на'].includes(command)) {
        require('./system_commands.js')(client, channel, sender, command, args, db, saveDb, isMod);
    }
    
    // ФАН-КОМАНДИ 
    if (['!пеніс', '!вкрасти', '!пиво'].includes(command)) {
        require('./fun_commands.js')(client, channel, sender, command, args, db, saveDb);
    }
});

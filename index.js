// @ts-nocheck
const tmi = require('tmi.js');
const fs = require('fs');
const http = require('http');

// ОБМАНКА ДЛЯ RENDER
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Бот працює!');
}).listen(process.env.PORT || 3000);

const client = new tmi.Client({
    identity: { username: 'r0masik_bot', password: 'oauth:v8wefxwrmrp9aee3774ogexiijsl6l' },
    channels: [ 'r0masik_' ]
});

// Завантаження бази
let db = fs.existsSync('db.json') ? JSON.parse(fs.readFileSync('db.json', 'utf8')) : {};
function saveDb() { fs.writeFileSync('db.json', JSON.stringify(db, null, 2)); }

client.connect().catch(console.error);

client.on('message', async (channel, tags, message, self) => {
    if (self) return;
    const sender = tags.username;
    const args = message.trim().split(' ');
    const command = args[0].toLowerCase();
    const isMod = tags.mod || (tags.badges && tags.badges.broadcaster === '1');

    // 1. АВТО-НАРАХУВАННЯ (за активність, якщо не команда)
    if (!message.startsWith('!')) {
        if (!db[sender]) db[sender] = 0;
        db[sender] += 1;
        saveDb();
    }

    // 2. СИСТЕМНІ КОМАНДИ (Бали, Рулетка, Топ, Дати, Розіграш)
    if (['!бали', '!рулетка', '!топ', '!дати', '!розіграш', '!го'].includes(command)) {
        require('./system_commands.js')(client, channel, sender, command, args, db, saveDb, isMod);
    }
    
    // 3. ФАН-КОМАНДИ (Пеніс, Вкрасти, Пиво)
    if (['!пеніс', '!вкрасти', '!пиво'].includes(command)) {
        require('./fun_commands.js')(client, channel, sender, command, args, db, saveDb);
    }

    // 4. ПЕРЕДАЧА БАЛІВ (Окремо для всіх)
    if (command === '!на') {
        require('./commands/na.js')(client, channel, sender, args, db, saveDb);
    }
});

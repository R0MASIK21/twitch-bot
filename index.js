// @ts-nocheck
const tmi = require('tmi.js');
const fs = require('fs');
const http = require('http');

let db = fs.existsSync('db.json') ? JSON.parse(fs.readFileSync('db.json', 'utf8')) : {};
function saveDb() { fs.writeFileSync('db.json', JSON.stringify(db, null, 2)); }

http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(db, null, 2));
}).listen(process.env.PORT || 3000);

const client = new tmi.Client({
    identity: { 
        username: 'r0masik_bot', 
        password: 'oauth:v8wefxwrmrp9aee3774ogexiijsl6l' // <-- Твій новий токен тут
    },
    channels: [ 'r0masik_' ]
});

client.connect().catch(console.error);

client.on('message', async (channel, tags, message, self) => {
    if (self) return;
    const sender = tags.username.toLowerCase();
    const args = message.trim().split(' ');
    const command = args[0].toLowerCase();
    const isMod = tags.mod || (tags.badges && tags.badges.broadcaster === '1');
    const isBroadcaster = tags.badges && tags.badges.broadcaster === '1';

    // 1. Авто-нарахування (+5 балів за повідомлення)
    require('./points_auto.js')(sender, message, db, saveDb, isBroadcaster);

    // 2. Окремі файли для кожної команди
    if (command === '!бали') require('./baly.js')(client, channel, sender, db);
    if (command === '!топ') require('./top.js')(client, channel, db);
    if (command === '!казік' || command === '!рулетка') require('./kazik.js')(client, channel, sender, args, db, saveDb);
    if (command === '!на') require('./na.js')(client, channel, sender, args, db, saveDb);
    
    // Адмінка
    if (command === '!дати' && isMod) require('./daty.js')(client, channel, args, db, saveDb);
    if (['!розіграш', '!го'].includes(command)) require('./rozihrash.js')(client, channel, sender, command, args, db, saveDb, isMod);

    // Фан-команди (Пеніс, Вкрасти, Пиво)
    if (['!пеніс', '!вкрасти', '!пиво'].includes(command)) require('./fun_commands.js')(client, channel, sender, command, args, db, saveDb);
});

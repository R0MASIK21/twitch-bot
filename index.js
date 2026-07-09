// @ts-nocheck
const tmi = require('tmi.js');
const fs = require('fs');

// Вічна пам'ять для Railway (щоб топ не скидався)
const dbPath = fs.existsSync('/app') ? '/app/data/db.json' : 'db.json';
let db = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath, 'utf8')) : {};

function saveDb() { 
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2)); 
}

const client = new tmi.Client({
    options: { debug: false },
    connection: { reconnect: true, secure: true },
    identity: {
        username: 'r0masik_bot', 
        password: 'oauth:v8wefxwrmrp9aee3774ogexiijsl6l' 
    },
    channels: ['r0masik_']
});

client.connect().catch(console.error);

// --- ПІДКЛЮЧАЄМО ВСІ ТВОЇ ФАЙЛИ З КОМАНДАМИ ---
const handlePointsAuto = require('./points_auto.js');
const handleBaly = require('./baly.js');
const handleTop = require('./top.js');
const handleKazik = require('./kazik.js');
const handleNa = require('./na.js');
const handleDaty = require('./daty.js');
const handleRozihrash = require('./rozihrash.js');
const handleFunCommands = require('./fun_commands.js');

client.on('message', (channel, tags, message, self) => {
    if (self) return;

    const sender = tags.username;
    const isBroadcaster = tags.badges?.broadcaster === '1';
    const isMod = tags.mod || isBroadcaster;
    const args = message.trim().split(/\s+/);
    const command = args[0].toLowerCase();

    // 1. Автонарахування балів (працює на кожне повідомлення)
    handlePointsAuto(sender, message, db, saveDb, isBroadcaster);

    // 2. Складні команди (розіграш та фан-команди перевіряють слова всередині своїх файлів)
    handleRozihrash(client, channel, sender, command, args, db, saveDb, isMod);
    handleFunCommands(client, channel, sender, command, args, isMod);

    // 3. Стандартні команди
    if (command === '!бали' || command === '!baly') {
        handleBaly(client, channel, sender, args, db);
    }
    
    if (command === '!топ' || command === '!top') {
        handleTop(client, channel, db);
    }

    if (command === '!казік' || command === '!kazik') {
        handleKazik(client, channel, sender, args, db, saveDb);
    }

    if (command === '!на') {
        handleNa(client, channel, sender, args, db, saveDb);
    }

    if (command === '!дати' && isMod) {
        handleDaty(client, channel, sender, args, db, saveDb);
    }
});

// =====================================================================
// ЖОРСТКИЙ АНТИ-ДУБЛЬ: Миттєве вимкнення без очікування
// =====================================================================
process.on('SIGTERM', () => {
    console.log('🔄 Оновлення коду! Миттєво вбиваємо старого бота...');
    process.exit(0); // Тупо вимикаємо процес цієї ж секунди
});

process.on('SIGINT', () => {
    console.log('🛑 Ручна зупинка бота...');
    process.exit(0);
});

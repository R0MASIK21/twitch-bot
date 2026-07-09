// @ts-nocheck
const tmi = require('tmi.js');
const fs = require('fs');

// ПАПКА БАЗИ (захищена /data на Railway)
const dataDir = fs.existsSync('/data') ? '/data' : '.';
const dbPath = `${dataDir}/db.json`;

// =====================================================================
// 1. БЕЗПЕЧНЕ ЧИТАННЯ (З БЕКАПОМ)
// =====================================================================
let db = {};
try {
    if (fs.existsSync(dbPath)) {
        let fileData = fs.readFileSync(dbPath, 'utf8').trim();
        if (fileData.length > 0) {
            db = JSON.parse(fileData);
        }
    }
} catch (err) {
    console.error("🚨 БАЗУ ПОШКОДЖЕНО ПРИ ПЕРЕЗАПУСКУ!", err.message);
    // Якщо файл зламався, не затираємо його, а робимо копію, щоб можна було врятувати!
    if (fs.existsSync(dbPath)) {
        fs.copyFileSync(dbPath, dbPath + '.backup_' + Date.now());
    }
    db = {}; 
}

// =====================================================================
// 2. БЕЗПЕЧНЕ ЗБЕРЕЖЕННЯ (ATOMIC WRITE - ЗАХИСТ ВІД ОБНУЛЕННЯ)
// =====================================================================
function saveDb() { 
    try {
        // Спочатку пишемо у тимчасовий файл
        fs.writeFileSync(dbPath + '.tmp', JSON.stringify(db, null, 2)); 
        // Миттєво перейменовуємо (Railway не зможе перервати цей процес на половині)
        fs.renameSync(dbPath + '.tmp', dbPath);
    } catch (err) {
        console.error("❌ Помилка запису бази:", err.message);
    }
}

// =====================================================================
// УЛЬТИМАТИВНИЙ АНТИ-ДУБЛЬ (ЧЕРЕЗ LOCK-ФАЙЛ)
// =====================================================================
const lockPath = `${dataDir}/lock.txt`;
const myBotId = Date.now().toString(); 

try { fs.writeFileSync(lockPath, myBotId, 'utf8'); } catch(e) {}

setInterval(() => {
    try {
        if (fs.existsSync(lockPath)) {
            const currentLock = fs.readFileSync(lockPath, 'utf8');
            if (currentLock !== myBotId) {
                console.log('💀 Прийшов новий бот! Старий миттєво робить харакірі...');
                process.exit(0); 
            }
        }
    } catch (e) {}
}, 2000); 

// =====================================================================
// ПІДКЛЮЧЕННЯ БОТА
// =====================================================================
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

    // ВИМКНЕНО бали за повідомлення (як ти і просив у минулому повідомленні)
    // Якщо захочеш повернути - просто прибери два слеші (//) перед наступним рядком
    // handlePointsAuto(sender, message, db, saveDb, isBroadcaster);
    
    handleRozihrash(client, channel, sender, command, args, db, saveDb, isMod);
    handleFunCommands(client, channel, sender, command, args, isMod);

    if (command === '!бали' || command === '!baly') handleBaly(client, channel, sender, args, db);
    if (command === '!топ' || command === '!top') handleTop(client, channel, db);
    if (command === '!казік' || command === '!kazik') handleKazik(client, channel, sender, args, db, saveDb);
    if (command === '!на') handleNa(client, channel, sender, args, db, saveDb);
    if (command === '!дати' && isMod) handleDaty(client, channel, sender, args, db, saveDb);
});

// Додатковий захист при вимкненні сервера
process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));

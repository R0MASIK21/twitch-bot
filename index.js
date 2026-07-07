// @ts-nocheck
const tmi = require('tmi.js');
const fs = require('fs');
const http = require('http'); // Підключаємо модуль для "сайту"

// ==========================================
// 🌐 ОБМАНКА ДЛЯ RENDER (ЩОБ ВІН ДУМАВ, ЩО ЦЕ САЙТ)
// ==========================================
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Твій бот працює, а Render думає, що це сайт!');
}).listen(process.env.PORT || 3000);
// ==========================================

const BOT_USERNAME = 'r0masik_bot'; 
const OAUTH_TOKEN = 'oauth:v8wefxwrmrp9aee3774ogexiijsl6l'; 
const CHANNEL_NAME = 'r0masik_'; // ВИПРАВЛЕНО НА ТВІЙ НІК

// ==========================================
// ⚙️ НАЛАШТУВАННЯ АВТО-НАРАХУВАННЯ:
// ==========================================
const INTERVAL_MINUTES = 2;      
const POINTS_PER_INTERVAL = 15;  
// ==========================================

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

// ⏱️ АВТО-НАРАХУВАННЯ БАЛІВ (ЗАКОМЕНТОВАНО, БО ТВІЧ ЗАКРИВ ЦЮ ФУНКЦІЮ І ВОНА КРАШИТЬ БОТА)
/*
setInterval(async () => {
    try {
        const chatters = await client.chatters(CHANNEL_NAME);
        const allViewers = [...chatters.broadcaster, ...chatters.moderators, ...chatters.viewers];
        for (const viewer of allViewers) {
            if (!db[viewer]) db[viewer] = 0;
            db[viewer] += POINTS_PER_INTERVAL;
        }
        saveDb();
    } catch (err) { console.error("Помилка нарахування:", err); }
}, INTERVAL_MINUTES * 60 * 1000);
*/

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

    if (command === '!бали') {
        client.say(channel, `@${sender}, у тебе ${db[sender]} балів 💵`);
    }

    // 🥷 ВКРАСТИ (ФІНАЛЬНА ВЕРСІЯ)
    if (command === '!вкрасти') {
        const jailChance = 0.50;
        const timeoutSec = 10;
        const penaltyPoints = 50;
        const lootTable = {
            'годинник⌚️': 200, 'пачку папіросів🚬': 50, 'тіліфон📱': 500, 'бутерброд🥪': 30,
            'енергетик🥤': 70, 'колесо🛞': 400, 'мішок бараболі🥔': 150, 'ключі від бехи🚘': 1000,
            'стік маккофе☕️': 20, 'пачку сємочок🌻': 10, 'труси🩲': 2500, 'Інтернет🌐': 800,
            'порчу😵‍💫': 100, 'Солоний огірок🥒': 30, 'Козу з носа👃': 5, 'Репутацію📉': 600,
            'Чоколаду🍫': 40, 'Ключ від серця💖': 300, 'Вареник з вишнею🥟': 50, 'Тарілку холодцю🍲': 90,
            'Пачку гречки🌾': 60, 'Заначку під матрацом💸': 1200, 'Ящик цибулі🧅': 80, 'Місце в черзі🧍': 150,
            'Кепку з надписом I love anal 🧢': 350, 'Останню нервову клітину🧠': 5000, 'Носки в сіточку🧦': 200,
            'Банку консервації🥫': 120, 'Пульт від тєліка в пакеті📺': 450, 'Шматок сала з часником🥓': 200,
            'Знижку в АТБ🛒': 300, 'Пачку мівіни🍜': 25, 'Свячену воду💧': 400, 'Тапки з готелю🧦': 150, 'Пароль від Wi-Fi🔑': 900
        };

        const items = Object.keys(lootTable);
        let randomLoot = items[Math.floor(Math.random() * items.length)];
        let reward = lootTable[randomLoot];
        
        let target = (args[1] || '').replace(/@/g, '').toLowerCase();
        if (!target || target === sender) {
            let users = Object.keys(db).filter(u => u !== sender);
            target = users[Math.floor(Math.random() * users.length)] || 'когось із чату';
        }
        let targetText = target === 'когось із чату' ? target : "@" + target;
        
        if (Math.random() < jailChance) {
            db[sender] = Math.max(0, db[sender] - penaltyPoints);
            saveDb();
            client.say(channel, `@${sender} Одягнув латексні рукавички, поліз до ${targetText}, але його зловили! 👮‍♂️`);
            setTimeout(() => client.timeout(channel, sender, timeoutSec, "Спійманий"), 850);
            setTimeout(() => client.say(channel, `Злодюгу @${sender} запакували на ${timeoutSec} сек і здерли штраф ${penaltyPoints} балів! ⚖️`), 1700);
        } else {
            db[sender] += reward;
            saveDb();
            let msg = (randomLoot === 'труси🩲') 
                ? `@${sender} Одягнув латексні рукавички, вкрав труси🩲 і віддав @tydasiuda! (Отримав ${reward} балів 💵)` 
                : `@${sender} Одягнув латексні рукавички, вкрав ${randomLoot} та отримав ${reward} балів 💵!`;
            client.say(channel, msg);
        }
    }
});

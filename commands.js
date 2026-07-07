// @ts-nocheck

// ==========================================
// ⚙️ НАЛАШТУВАННЯ КОМАНД (ЗМІНЮЙ ТУТ):
// ==========================================
const JAIL_CHANCE = 0.35;       // Шанс попастися при крадіжці (0.35 = 35%)
const TIMEOUT_SEC = 30;         // На скільки секунд давати таймаут за крадіжку
const PENALTY_POINTS = 50;      // Скільки балів забирати як штраф
const TOP_LIMIT = 5;            // Скільки людей показувати в команді !топ

const LOOT_TABLE = {
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
// ==========================================

// ЗМІННІ ДЛЯ ЗБЕРЕЖЕННЯ СТАНУ РОЗІГРАШУ
let giveawayActive = false;
let participants = [];

module.exports = function handleCommands(client, channel, tags, message, command, args, db, saveDb, sender) {
    // Перевірка, чи є людина модератором або стрімером
    const isMod = tags.mod || (tags.badges && tags.badges.broadcaster === '1');

    // 💰 БАЛИ
    if (command === '!бали') {
        client.say(channel, `@${sender}, у тебе ${db[sender]} балів 💵`);
    }

    // 🏆 ТОП
    if (command === '!топ') {
        const sortedDb = Object.entries(db).sort((a, b) => b[1] - a[1]).slice(0, TOP_LIMIT);
        if (sortedDb.length === 0) {
            client.say(channel, `Топ поки порожній!`);
            return;
        }
        let topText = sortedDb.map((entry, index) => `${index + 1}. ${entry[0]} (${entry[1]})`).join(' | ');
        client.say(channel, `🏆 Топ багатіїв: ${topText}`);
    }

    // 🎉 СТАРТ РОЗІГРАШУ (АДМІНКА) - АВТОМАТИЧНИЙ З РАНДОМНОЮ СУМОЮ
    if (command === '!розіграш') {
        if (!isMod) return; 
        if (giveawayActive) return; // Щоб не запустити два розіграші одночасно

        let pot = parseInt(args[1]);
        
        // Якщо суму не вказано, бот бере рандом до 1 мільйона балів!
        if (isNaN(pot) || pot <= 0) {
            const minPoints = 1;       // Мінімалка
            const maxPoints = 10000000000000000000000000000000000000000000;   // 1 МІЛЬЙОН (можеш дописати сюди ще нулів, якщо треба)
            pot = Math.floor(Math.random() * (maxPoints - minPoints + 1)) + minPoints;
        }
        
        giveawayActive = true;
        participants = []; 
        
        client.say(channel, `Увага! Розіграш на ${pot} балів розпочато! 🎉 Пишіть !го у чат, у вас є 30 секунд!`);

       // Автоматичний кінець через 30 секунд
        setTimeout(() => {
            if (!giveawayActive) return;
            giveawayActive = false;

            if (participants.length === 0) {
                client.say(channel, `Ніхто не написав !го. Розіграш скасовано 😢`);
                return;
            }

            // Рандомний режим фіналу: 50% шанс на все одному або 50% поділити на всіх
            let splitMode = Math.random() < 0.5;

            if (splitMode && participants.length > 1) {
                let share = Math.floor(pot / participants.length);
                participants.forEach(p => {
                    if (!db[p]) db[p] = 0;
                    db[p] += share;
                });
                saveDb();
                
                // Збираємо ніки всіх, хто виграв, в один рядок
                let winnersList = participants.map(p => '@' + p).join(', ');
                
                client.say(channel, `🎉 Розіграш завершено! Переможці: ${winnersList}! Ви ділите виграш і отримуєте по ${share} балів кожний! 🤝`);
            } else {
                const winner = participants[Math.floor(Math.random() * participants.length)];
                if (!db[winner]) db[winner] = 0;
                db[winner] += pot;
                saveDb();
                client.say(channel, `🎉 Розіграш завершено! Переможець: @${winner}! Він забирає всі ${pot} балів! 🎁`);
            }
            participants = []; 
        }, 30000);
    
    }

    // 🙋‍♂️ УЧАСТЬ У РОЗІГРАШІ
    if (command === '!го') {
        if (giveawayActive && !participants.includes(sender)) {
            participants.push(sender);
            // Бот мовчки додає учасника, щоб не спамити в чаті
        }
    }

    // 🛑 КІНЕЦЬ РОЗІГРАШУ ТА ВИБІР ПЕРЕМОЖЦЯ (АДМІНКА)
    if (command === '!кінець') {
        if (!isMod) return;
        if (!giveawayActive) {
            client.say(channel, `Розіграш зараз не проводиться.`);
            return;
        }
        
        giveawayActive = false; // Закриваємо розіграш

        if (participants.length === 0) {
            client.say(channel, `Ніхто не написав !го. Розіграш скасовано 😢`);
            return;
        }

        // Вибираємо рандомного переможця
        const winner = participants[Math.floor(Math.random() * participants.length)];
        client.say(channel, `🎉 Розіграш завершено! Переможець: @${winner}! Вітаємо! 🎁 (Всього учасників: ${participants.length})`);
        participants = []; // Очищаємо список після завершення
    }

    // 💸 ДАТИ БАЛИ (АДМІНКА)
    if (command === '!дати') {
        if (!isMod) {
            client.say(channel, `@${sender}, ця команда тільки для модераторів та стрімера! 🛑`);
            return;
        }

        let amount = parseInt(args[1]);
        let target = (args[2] || '').replace(/@/g, '').toLowerCase();

        if (isNaN(amount)) {
            amount = parseInt(args[2]);
            target = (args[1] || '').replace(/@/g, '').toLowerCase();
        }

        if (isNaN(amount) || amount <= 0 || !target) {
            client.say(channel, `@${sender}, неправильний формат! Пиши: !дати 100 @нік`);
            return;
        }
        
        if (!db[target]) db[target] = 0;
        db[target] += amount;
        saveDb();

        client.say(channel, `@${sender} відсипав ${amount} балів для @${target}! 💸`);
    }

    // 🤝 ПЕРЕДАТИ СВОЇ БАЛИ (Для всіх глядачів)
    if (command === '!на') {
        let amount = parseInt(args[1]);
        let target = (args[2] || '').replace(/@/g, '').toLowerCase();

        if (isNaN(amount)) {
            amount = parseInt(args[2]);
            target = (args[1] || '').replace(/@/g, '').toLowerCase();
        }

        if (isNaN(amount) || amount <= 0 || !target) {
            client.say(channel, `@${sender}, неправильний формат! Пиши: !на 100 @нік`);
            return;
        }

        if (db[sender] < amount) {
            client.say(channel, `@${sender}, у тебе недостатньо балів! ❌`);
            return;
        }

        db[sender] -= amount;
        if (!db[target]) db[target] = 0;
        db[target] += amount;
        saveDb();

        client.say(channel, `@${sender} передав ${amount} балів глядачу @${target}! 🤝`);
    }

    // 🥷 ВКРАСТИ
    if (command === '!вкрасти') {
        const items = Object.keys(LOOT_TABLE);
        let randomLoot = items[Math.floor(Math.random() * items.length)];
        let reward = LOOT_TABLE[randomLoot];
        
        let target = (args[1] || '').replace(/@/g, '').toLowerCase();
        if (!target || target === sender) {
            let users = Object.keys(db).filter(u => u !== sender);
            target = users[Math.floor(Math.random() * users.length)] || 'когось із чату';
        }
        let targetText = target === 'когось із чату' ? target : "@" + target;
        
        if (Math.random() < JAIL_CHANCE) {
            db[sender] = Math.max(0, db[sender] - PENALTY_POINTS);
            saveDb();
            client.say(channel, `@${sender} Одягнув латексні рукавички, поліз до ${targetText}, але його зловили! 👮‍♂️`);
            
            setTimeout(() => {
                client.timeout(channel, sender, TIMEOUT_SEC, "Спійманий на гарячому")
                    .catch(err => console.log("Спроба дати таймаут стрімеру/модеру проігнорована."));
            }, 850);
            
            setTimeout(() => client.say(channel, `Злодюгу @${sender} запакували на ${TIMEOUT_SEC} сек і здерли штраф ${PENALTY_POINTS} балів! ⚖️`), 1700);
        } else {
            db[sender] += reward;
            saveDb();
            let msg = (randomLoot === 'труси🩲') 
                ? `@${sender} Одягнув латексні рукавички, вкрав труси🩲 і віддав @tydasiuda! (Отримав ${reward} балів 💵)` 
                : `@${sender} Одягнув латексні рукавички, вкрав ${randomLoot} та отримав ${reward} балів 💵!`;
            client.say(channel, msg);
        }
    }
};

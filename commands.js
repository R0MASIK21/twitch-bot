// @ts-nocheck

module.exports = function handleCommands(client, channel, tags, message, command, args, db, saveDb, sender) {
    // Перевірка, чи є людина модератором або стрімером
    const isMod = tags.mod || (tags.badges && tags.badges.broadcaster === '1');

    // 💰 БАЛИ
    if (command === '!бали') {
        client.say(channel, `@${sender}, у тебе ${db[sender]} балів 💵`);
    }

    // 🏆 ТОП
    if (command === '!топ') {
        const sortedDb = Object.entries(db).sort((a, b) => b[1] - a[1]).slice(0, 5);
        if (sortedDb.length === 0) {
            client.say(channel, `Топ поки порожній!`);
            return;
        }
        let topText = sortedDb.map((entry, index) => `${index + 1}. ${entry[0]} (${entry[1]})`).join(' | ');
        client.say(channel, `🏆 Топ багатіїв: ${topText}`);
    }

    // 🎉 РОЗІГРАШ
    if (command === '!розіграш') {
        if (!isMod) return; 
        client.say(channel, `Увага! Розіграш розпочато! 🎉 Пишіть у чат, щоб взяти участь!`);
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
        const jailChance = 0.35;
        const timeoutSec = 30; 
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
            
            setTimeout(() => {
                client.timeout(channel, sender, timeoutSec, "Спійманий на гарячому")
                    .catch(err => console.log("Спроба дати таймаут стрімеру/модеру проігнорована."));
            }, 850);
            
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
};

// @ts-nocheck
const JAIL_CHANCE = 0.35;       
const TIMEOUT_SEC = 30;         
const PENALTY_POINTS = 50;      

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

module.exports = function(client, channel, sender, command, args, db, saveDb) {
    
    // 📏 ПЕНІС
    if (command === '!пеніс') {
        const size = Math.floor(Math.random() * (50 - (-1) + 1)) + (-1);
        
        let message = "";
        if (size < 0) {
            message = `@${sender}, твій пеніс... е-е... в тебе його нема? (Розмір: ${size} см) 🤏`;
        } else if (size === 0) {
            message = `@${sender}, ну, як сказати... розмір ${size} см. Буває. 😶`;
        } else if (size < 15) {
            message = `@${sender}, ну, ${size} см... зате технічний! 📏`;
        } else if (size < 30) {
            message = `@${sender}, о-о, ${size} см! Непогано, гідний результат! 💪`;
        } else {
            message = `@${sender}, НІФІГА СОБІ! ${size} см! Ти впевнений, що це не лінійка? 🤯`;
        }
        
        client.say(channel, message);
    }

    // 🍺 ПИВО
    if (command === '!пиво') {
        client.say(channel, `@${sender} відкриває холодне пивко і робить великий ковток! Життя прекрасне! 🍺😎`);
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
            db[sender] = Math.max(0, (db[sender] || 0) - PENALTY_POINTS);
            saveDb();
            client.say(channel, `@${sender} Одягнув латексні рукавички, поліз до ${targetText}, але його зловили! 👮‍♂️`);
            
            setTimeout(() => {
                client.timeout(channel, sender, TIMEOUT_SEC, "Спійманий на гарячому")
                    .catch(err => console.log("Спроба дати таймаут стрімеру/модеру проігнорована."));
            }, 850);
            
            setTimeout(() => client.say(channel, `Злодюгу @${sender} запакували на ${TIMEOUT_SEC} сек і здерли штраф ${PENALTY_POINTS} балів! ⚖️`), 1700);
        } else {
            if (!db[sender]) db[sender] = 0;
            db[sender] += reward;
            saveDb();
            let msg = (randomLoot === 'труси🩲') 
                ? `@${sender} Одягнув латексні рукавички, вкрав труси🩲 і віддав @tydasiuda! (Отримав ${reward} балів 💵)` 
                : `@${sender} Одягнув латексні рукавички, вкрав ${randomLoot} та отримав ${reward} балів 💵!`;
            client.say(channel, msg);
        }
    }
};

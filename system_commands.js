// @ts-nocheck
let giveawayActive = false;
let participants = [];

// Сховище для псевдорандому рулетки (скидається при перезапуску бота)
const rouletteStreaks = {}; 

module.exports = function(client, channel, sender, command, args, db, saveDb, isMod) {
    // 💰 БАЛИ
    if (command === '!бали') {
        client.say(channel, `@${sender}, у тебе ${db[sender] || 0} балів 💵`);
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

    // 🔫 РУЛЕТКА (З псевдорандомом та ставкою "all")
    if (command === '!рулетка') {
        let betStr = (args[1] || '').toLowerCase();
        let bet;

        // Перевірка на all
        if (betStr === 'all' || betStr === 'все' || betStr === 'всі') {
            bet = db[sender] || 0;
        } else {
            bet = parseInt(betStr);
            if (isNaN(bet) || bet <= 0) {
                bet = 100; // Стандартна ставка, якщо не вказано іншу
            }
        }

        if ((db[sender] || 0) < bet || bet <= 0) {
            client.say(channel, `@${sender}, у тебе немає стільки балів для ставки! ❌`);
            return;
        }

        if (!rouletteStreaks[sender]) rouletteStreaks[sender] = 0;
        
        // Базовий шанс 50% (0.5). Кожний програш додає +20% (0.2)
        let winChance = 0.5 + (rouletteStreaks[sender] * 0.2);

        if (Math.random() < winChance) {
            rouletteStreaks[sender] = 0; // Скидаємо стрік після виживання
            db[sender] += bet; // Виграє суму ставки
            saveDb();
            client.say(channel, `@${sender} крутить рулетку... Пощастило! Вижив і виграв ${bet} балів! 🔫😎`);
        } else {
            rouletteStreaks[sender] += 1; // Накидаємо шанс на наступний раз
            db[sender] -= bet; // Втрачає ставку
            saveDb();
            client.say(channel, `@${sender} крутить рулетку... ПУК! Мінус ${bet} балів! Не щастить. 🔫💀`);
        }
    }

    // 🤝 НА (Передача балів - ДЛЯ ВСІХ, з підтримкою "all")
    if (command === '!на') {
        let arg1 = (args[1] || '').toLowerCase();
        let arg2 = (args[2] || '').toLowerCase();
        let target = '';
        let amount = 0;

        // Визначаємо, де нік, а де сума/all
        if (arg1.startsWith('@') || (!parseInt(arg1) && arg1 !== 'all' && arg1 !== 'все')) {
            target = arg1.replace(/@/g, '');
            amount = (arg2 === 'all' || arg2 === 'все' || arg2 === 'всі') ? (db[sender] || 0) : parseInt(arg2);
        } else {
            target = arg2.replace(/@/g, '');
            amount = (arg1 === 'all' || arg1 === 'все' || arg1 === 'всі') ? (db[sender] || 0) : parseInt(arg1);
        }

        if (!target || isNaN(amount) || amount <= 0) {
            client.say(channel, `@${sender}, неправильний формат! Пиши: !на 100 @нік або !на all @нік`);
            return;
        }

        if ((db[sender] || 0) < amount) {
            client.say(channel, `@${sender}, у тебе недостатньо балів! ❌`);
            return;
        }

        db[sender] -= amount;
        if (!db[target]) db[target] = 0;
        db[target] += amount;
        saveDb();

        client.say(channel, `@${sender} передав ${amount} балів глядачу @${target}! 🤝`);
    }

    // 🙋‍♂️ ГО (Участь у розіграші - ДЛЯ ВСІХ)
    if (command === '!го') {
        if (giveawayActive && !participants.includes(sender)) {
            participants.push(sender);
        }
    }

    // ==========================================
    // АДМІНКА (ТІЛЬКИ МОДЕРАТОРИ І СТРІМЕР)
    // ==========================================
    if (isMod) {
        // 💸 ДАТИ БАЛИ
        if (command === '!дати') {
            let amount = parseInt(args[1]);
            let target = (args[2] || '').replace(/@/g, '').toLowerCase();

            if (isNaN(amount)) {
                amount = parseInt(args[2]);
                target = (args[1] || '').replace(/@/g, '').toLowerCase();
            }

            if (isNaN(amount) || amount < 0 || !target) {
                client.say(channel, `@${sender}, неправильний формат! Пиши: !дати 100 @нік (або !дати 0 @нік, щоб обнулити)`);
                return;
            }
            
            if (amount === 0) {
                db[target] = 0;
                saveDb();
                client.say(channel, `Увага! @${sender} повністю обнулив баланс користувача @${target}! 📉💀`);
            } else {
                if (!db[target]) db[target] = 0;
                db[target] += amount;
                saveDb();
                client.say(channel, `@${sender} відсипав ${amount} балів для @${target}! 💸`);
            }
        }

        // 🎉 РОЗІГРАШ (З таймерами та текстами)
        if (command === '!розіграш') {
            if (giveawayActive) return; 

            let pot = parseInt(args[1]);
            if (isNaN(pot) || pot <= 0) {
                const minPoints = 100;
                const maxPoints = 1000000;
                pot = Math.floor(Math.random() * (maxPoints - minPoints + 1)) + minPoints;
            }
            
            giveawayActive = true;
            participants = []; 
            
            client.say(channel, `Увага! Розіграш на ${pot} балів розпочато! 🎉 Пишіть !го у чат, у вас є 30 секунд!`);

            setTimeout(() => {
                if (giveawayActive) client.say(channel, `⏳ Залишилося 15 секунд! Хто ще не написав !го - поспішайте!`);
            }, 15000);

            setTimeout(() => {
                if (giveawayActive) client.say(channel, `⏱️ 5 секунд до кінця розіграшу!`);
            }, 25000);

            setTimeout(() => {
                if (!giveawayActive) return;
                giveawayActive = false;

                if (participants.length === 0) {
                    client.say(channel, `Ніхто не написав !го. Розіграш скасовано 😢`);
                    return;
                }

                let splitMode = Math.random() < 0.5;

                if (splitMode && participants.length > 1) {
                    let share = Math.floor(pot / participants.length);
                    participants.forEach(p => {
                        if (!db[p]) db[p] = 0;
                        db[p] += share;
                    });
                    saveDb();
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
    }
};

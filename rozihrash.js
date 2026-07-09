let giveawayActive = false;
let participants = [];
let prize = 0;
let activeTimers = []; 

// Функція для фіналу розіграшу (вибирає переможців і ділить банк)
function finishGiveaway(client, channel, db, saveDb) {
    if (participants.length === 0) {
        client.say(channel, "⏱️ Розіграш завершено! Але ніхто так і не взяв участь 😔");
        return;
    }

    // 15% шанс на "Джекпот" (1-2 переможці), 85% шанс на "Звичайний" (до 10 переможців)
    let isJackpot = (Math.random() * 100) <= 15;
    
    // Якщо джекпот — вибираємо 1 або 2 людей. Якщо ні — до 10 людей.
    let winnersCount = isJackpot ? (Math.random() < 0.5 ? 1 : 2) : 10;
    
    // Якщо учасників менше, ніж бот захотів вибрати, то виграють усі, хто є
    winnersCount = Math.min(winnersCount, participants.length);

    // Перемішуємо список учасників, як колоду карт
    let shuffled = [...participants];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Беремо перших щасливчиків після перемішування
    let winners = shuffled.slice(0, winnersCount);
    
    // Ділимо банк на кількість переможців
    let share = Math.floor(prize / winners.length);

    for (let w of winners) {
        db[w] = (db[w] || 0) + share;
    }
    saveDb();

    let winnersText = winners.map(w => `@${w}`).join(', ');

    // Видаємо повідомлення залежно від того, як випало
    if (isJackpot) {
        client.say(channel, `🎰 ДЖЕКПОТ! Банк не ділиться на натовп! ${winnersText} забирає весь куш: по ${share} 💵 балів! 🔥`);
    } else {
        client.say(channel, `🎉 ЧАС ВИЙШОВ! Банк розпиляли між ${winners.length} учасниками: ${winnersText}! Кожен забрав по ${share} 💵!`);
    }
}

module.exports = function(client, channel, sender, command, args, db, saveDb, isMod) {
    
    if (command === '!розіграш' && isMod) {
        
        // ДОСТРОКОВА ЗУПИНКА
        if (args[1] === 'стоп') {
            if (!giveawayActive) {
                return client.say(channel, "Розіграш зараз не проводиться.");
            }
            
            activeTimers.forEach(timer => clearTimeout(timer));
            activeTimers = [];
            giveawayActive = false;

            // Викликаємо фінал достроково
            return finishGiveaway(client, channel, db, saveDb);
        }

        // СТАРТ РОЗІГРАШУ
        let amount = parseInt(args[1]);
        let duration = parseInt(args[2]) || 30; // Дефолт 30 секунд

        if (isNaN(amount) || amount <= 0) {
            return client.say(channel, "Формат: !розіграш [сума] або !розіграш [сума] [секунди]");
        }

        if (giveawayActive) {
            return client.say(channel, "Розіграш вже йде!");
        }

        giveawayActive = true;
        participants = [];
        prize = amount;
        activeTimers = []; 
        
        // ПРИБРАВ текст про шанси! Тільки банк і час.
        client.say(channel, `🎁 Банк: ${prize} 💵! До кінця розіграшу залишилось ${duration} секунд! Встигни написати !го`);

        // --- ВІДЛІК У ЧАТ ---
        
        if (duration > 30) {
            activeTimers.push(setTimeout(() => {
                if (giveawayActive) client.say(channel, `⏳ До кінця розіграшу залишилось 3 0 секунд! Встигни написати !го`);
            }, (duration - 30) * 1000));
        }

        if (duration >= 20) {
            activeTimers.push(setTimeout(() => {
                if (giveawayActive) client.say(channel, `⏳ До кінця розіграшу залишилось 2 0 секунд!`);
            }, (duration - 20) * 1000));
        }
        
        if (duration >= 10) {
            activeTimers.push(setTimeout(() => {
                if (giveawayActive) client.say(channel, `🚨 Останні 1 0 секунд! Пиши !го`);
            }, (duration - 10) * 1000));
        }

        if (duration >= 5) {
            activeTimers.push(setTimeout(() => {
                if (giveawayActive) client.say(channel, `🔥 5 секунд!`);
            }, (duration - 5) * 1000));
        }

        // --- АВТОМАТИЧНИЙ ФІНАЛ ---
        activeTimers.push(setTimeout(() => {
            if (!giveawayActive) return; 
            giveawayActive = false;
            
            // Викликаємо нашу круту функцію з джекпотом
            finishGiveaway(client, channel, db, saveDb);
            
        }, duration * 1000)); 
    }

    // РЕЄСТРАЦІЯ УЧАСНИКІВ
    if (command === '!го') {
        if (!giveawayActive) return; 
        
        if (!participants.includes(sender)) {
            participants.push(sender);
            client.say(channel, `@${sender}, ти в грі! 🎟️`);
        }
    }
};

let giveawayActive = false;
let participants = [];
let prize = 0;
let timeLeft = 0;
let timerInterval = null;

// Функція фіналу (Джекпот або звичайний поділ)
function finishGiveaway(client, channel, db, saveDb) {
    try {
        if (participants.length === 0) {
            client.say(channel, "⏱️ Розіграш завершено! Але ніхто так і не взяв участь 😔");
            return;
        }
        
        // 15% шанс на джекпот
        let isJackpot = (Math.random() * 100) <= 15; 
        let winnersCount = isJackpot ? (Math.random() < 0.5 ? 1 : 2) : 10;
        winnersCount = Math.min(winnersCount, participants.length);

        // Перемішуємо учасників
        let shuffled = [...participants];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        let winners = shuffled.slice(0, winnersCount);
        let share = Math.floor(prize / winners.length);

        // Нараховуємо бали
        for (let w of winners) {
            db[w] = (db[w] || 0) + share;
        }
        saveDb();

        let winnersText = winners.map(w => `@${w}`).join(', ');

        if (isJackpot) {
            client.say(channel, `🎰 ДЖЕКПОТ! Банк не ділиться на натовп! ${winnersText} забирає весь куш: по ${share} 💵 балів! 🔥`);
        } else {
            client.say(channel, `🎉 ЧАС ВИЙШОВ! Банк розпиляли між ${winners.length} учасниками: ${winnersText}! Кожен забрав по ${share} 💵!`);
        }
    } catch (error) {
        // Якщо станеться якась херня, бот напише про це в чат, а не просто зависне
        console.error("Помилка фіналу:", error);
        client.say(channel, `❌ Помилка при завершенні розіграшу: ${error.message}`);
    }
}

module.exports = function(client, channel, sender, command, args, db, saveDb, isMod) {
    
    // КОМАНДА ДЛЯ УЧАСТІ
    if (command === '!го') {
        if (!giveawayActive) return; 
        if (!participants.includes(sender)) {
            participants.push(sender);
            client.say(channel, `@${sender}, ти в грі! 🎟️`);
        }
    }

    // СТАРТ АБО СТОП
    if (command === '!розіграш' && isMod) {
        
        if (args[1] === 'стоп') {
            if (!giveawayActive) return client.say(channel, "Розіграш зараз не проводиться.");
            clearInterval(timerInterval);
            giveawayActive = false;
            return finishGiveaway(client, channel, db, saveDb);
        }

        let amount = parseInt(args[1]);
        let duration = parseInt(args[2]) || 30; // Дефолт 30 секунд

        if (isNaN(amount) || amount <= 0) {
            return client.say(channel, `Формат: !розіграш [сума] або !розіграш [сума] [секунди]`);
        }

        if (giveawayActive) return client.say(channel, "Розіграш вже йде!");

        giveawayActive = true;
        participants = [];
        prize = amount;
        timeLeft = duration;

        client.say(channel, `🎁 Банк: ${prize} 💵! До кінця розіграшу залишилось ${timeLeft} секунд! Встигни написати !го`);

        // ОДИН ЄДИНИЙ ТАЙМЕР, ЯКИЙ РАХУЄ ЩОСЕКУНДИ
        timerInterval = setInterval(() => {
            timeLeft--; // Віднімаємо 1 секунду

            if (timeLeft === 30 && duration > 30) {
                client.say(channel, `⏳ До кінця розіграшу залишилось 3 0 секунд! Встигни написати !го`);
            } else if (timeLeft === 20) {
                client.say(channel, `⏳ До кінця розіграшу залишилось 2 0 секунд!`);
            } else if (timeLeft === 10) {
                client.say(channel, `🚨 Останні 1 0 секунд! Пиши !го`);
            } else if (timeLeft === 5) {
                client.say(channel, `🔥 5 секунд!`);
            } else if (timeLeft <= 0) {
                // Коли час вийшов — зупиняємо годинник і викликаємо фінал
                clearInterval(timerInterval);
                giveawayActive = false;
                finishGiveaway(client, channel, db, saveDb);
            }
        }, 1000); // 1000 мілісекунд = 1 секунда
    }
};

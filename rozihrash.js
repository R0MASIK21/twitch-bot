let giveawayActive = false;
let participants = [];
let prize = 0;
let winChance = 50;
let activeTimers = []; 

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

            if (participants.length === 0) {
                return client.say(channel, "Розіграш зупинено. Ніхто не брав участь 😔");
            }
            
            let winners = participants.filter(() => (Math.random() * 100) <= winChance);
            
            if (winners.length === 0) {
                participants = [];
                return client.say(channel, `🛑 Розіграш зупинено! Ніхто не зміг виграти (шанс був ${winChance}%). Приз згорів! 🔥`);
            }

            let share = Math.floor(prize / winners.length);
            for (let w of winners) {
                db[w] = (db[w] || 0) + share;
            }
            saveDb();
            
            let winnersText = winners.length > 5 ? `${winners.length} щасливчиків` : winners.map(w => `@${w}`).join(', ');
            participants = []; 
            return client.say(channel, `🛑 Стоп! Переможці: ${winnersText}! Кожен отримує по ${share} 💵 балів!`);
        }

        // СТАРТ РОЗІГРАШУ
        let amount = parseInt(args[1]);
        let duration = parseInt(args[2]) || 30; // Дефолт 30 секунд
        let chance = parseInt(args[3]) || 50;   

        if (isNaN(amount) || amount <= 0) {
            return client.say(channel, "Формат: !розіграш [сума] [секунди] [шанс%]. Наприклад: !розіграш 1000 або !розіграш 1000 60");
        }
        if (chance < 1) chance = 1;
        if (chance > 100) chance = 100;

        if (giveawayActive) {
            return client.say(channel, "Розіграш вже йде!");
        }

        giveawayActive = true;
        participants = [];
        prize = amount;
        winChance = chance;
        activeTimers = []; 
        
        // Стартове повідомлення, як ти просив
        client.say(channel, `🎁 Банк: ${prize} 💵! До кінця розіграшу залишилось ${duration} секунд! Встигни написати !го (Шанс: ${winChance}%)`);

        // --- ВІДЛІК У ЧАТ ---
        
        // Нагадування за 30 секунд (тільки якщо ставиш час більше 30 секунд, наприклад 60)
        if (duration > 30) {
            activeTimers.push(setTimeout(() => {
                if (giveawayActive) client.say(channel, `⏳ До кінця розіграшу залишилось 30 секунд! Встигни написати !го`);
            }, (duration - 30) * 1000));
        }

        // Нагадування за 20 секунд до кінця
        if (duration >= 20) {
            activeTimers.push(setTimeout(() => {
                if (giveawayActive) client.say(channel, `⏳ До кінця розіграшу залишилось 20 секунд!`);
            }, (duration - 20) * 1000));
        }
        
        // Нагадування за 10 секунд до кінця
        if (duration >= 10) {
            activeTimers.push(setTimeout(() => {
                if (giveawayActive) client.say(channel, `🚨 Останні 10 секунд! Шанс виграти — ${winChance}%! Пиши !го`);
            }, (duration - 10) * 1000));
        }

        // Нагадування за 5 секунд до кінця
        if (duration >= 5) {
            activeTimers.push(setTimeout(() => {
                if (giveawayActive) client.say(channel, `🔥 5 секунд!`);
            }, (duration - 5) * 1000));
        }

        // --- АВТОМАТИЧНИЙ ФІНАЛ ---
        activeTimers.push(setTimeout(() => {
            if (!giveawayActive) return; 
            giveawayActive = false;
            
            if (participants.length === 0) {
                return client.say(channel, "⏱️ Час вийшов! Але ніхто так і не взяв участь 😔");
            }

            let winners = participants.filter(() => (Math.random() * 100) <= winChance);

            if (winners.length === 0) {
                participants = [];
                return client.say(channel, `⏱️ Час вийшов! Халепа, ніхто не виграв (шанс був ${winChance}%). Всі ${prize} 💵 згоріли! 🔥`);
            }

            let share = Math.floor(prize / winners.length);
            for (let w of winners) {
                db[w] = (db[w] || 0) + share;
            }
            saveDb();
            
            let winnersText = winners.length > 5 ? `${winners.length} щасливчиків` : winners.map(w => `@${w}`).join(', ');
            
            participants = [];
            client.say(channel, `🎉 ЧАС ВИЙШОВ! Банк розпиляли: ${winnersText}! Кожен забрав по ${share} 💵 балів!`);
            
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

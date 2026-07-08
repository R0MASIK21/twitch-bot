let giveawayActive = false;
let participants = [];
let prize = 0;
let giveawayTimer = null;
let winChance = 50; // Шанс виграти за замовчуванням (якщо ти не вкажеш)

module.exports = function(client, channel, sender, command, args, db, saveDb, isMod) {
    
    if (command === '!розіграш' && isMod) {
        
        // ДОСТРОКОВА ЗУПИНКА ТА РОЗПОДІЛ ПРИЗУ
        if (args[1] === 'стоп') {
            if (!giveawayActive) {
                return client.say(channel, "Розіграш зараз не проводиться.");
            }
            if (giveawayTimer) clearTimeout(giveawayTimer);
            giveawayActive = false;

            if (participants.length === 0) {
                return client.say(channel, "Розіграш зупинено. Ніхто не брав участь 😔");
            }
            
            // Відбираємо переможців за шансом
            let winners = participants.filter(() => (Math.random() * 100) <= winChance);
            
            if (winners.length === 0) {
                participants = [];
                return client.say(channel, `🛑 Розіграш зупинено! Ніхто не зміг виграти (шанс був ${winChance}%). Приз згорів! 🔥`);
            }

            // Ділимо приз
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
        let duration = parseInt(args[2]) || 60; // Час (дефолт 60 сек)
        let chance = parseInt(args[3]) || 50;   // Шанс виграшу (дефолт 50%)

        if (isNaN(amount) || amount <= 0) {
            return client.say(channel, "Формат: !розіграш [сума] [секунди] [шанс%]. Наприклад: !розіграш 1000 60 30");
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
        
        client.say(channel, `🎁 Банк: ${prize} 💵! Час: ${duration} сек. Шанс перемоги: ${winChance}%. Приз поділять ті, кому пощастить! Пишіть !го`);

        // АВТОМАТИЧНИЙ ФІНАЛ
        giveawayTimer = setTimeout(() => {
            if (!giveawayActive) return; 
            giveawayActive = false;
            
            if (participants.length === 0) {
                return client.say(channel, "⏱️ Час вийшов! Але ніхто так і не взяв участь 😔");
            }

            // Відбираємо переможців
            let winners = participants.filter(() => (Math.random() * 100) <= winChance);

            if (winners.length === 0) {
                participants = [];
                return client.say(channel, `⏱️ Час вийшов! Халепа, ніхто не виграв (шанс був ${winChance}%). Всі ${prize} 💵 згоріли! 🔥`);
            }

            // Ділимо банк порівну
            let share = Math.floor(prize / winners.length);
            for (let w of winners) {
                db[w] = (db[w] || 0) + share;
            }
            saveDb();
            
            // Якщо переможців більше 5, просто пишемо кількість, щоб не спамити стіною тексту
            let winnersText = winners.length > 5 ? `${winners.length} щасливчиків` : winners.map(w => `@${w}`).join(', ');
            
            participants = [];
            client.say(channel, `🎉 ЧАС ВИЙШОВ! Банк розпиляли: ${winnersText}! Кожен забрав по ${share} 💵 балів!`);
            
        }, duration * 1000); 
    }

    // РЕЄСТРАЦІЯ УЧАСНИКІВ
    if (command === '!го') {
        if (!giveawayActive) return; 
        
        if (!participants.includes(sender)) {
            participants.push(sender);
            client.say(channel, `@${sender}, ти в грі! 🎟️ (Шанс: ${winChance}%)`);
        }
    }
};

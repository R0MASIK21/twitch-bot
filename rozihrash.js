let giveawayActive = false;
let participants = [];
let prize = 0;
let giveawayTimer = null;

module.exports = function(client, channel, sender, command, args, db, saveDb, isMod) {
    
    // Команда для адміна/модера: почати розіграш або зупинити
    if (command === '!розіграш' && isMod) {
        
        // Дострокова зупинка розіграшу (якщо треба вибрати переможця прямо зараз)
        if (args[1] === 'стоп') {
            if (!giveawayActive) {
                return client.say(channel, "Розіграш зараз не проводиться.");
            }
            
            // Зупиняємо автоматичний таймер
            if (giveawayTimer) clearTimeout(giveawayTimer);
            giveawayActive = false;

            if (participants.length === 0) {
                return client.say(channel, "Розіграш зупинено. Ніхто не брав участь 😔");
            }
            
            // Вибираємо переможця
            let winner = participants[Math.floor(Math.random() * participants.length)];
            db[winner] = (db[winner] || 0) + prize;
            saveDb();
            
            participants = []; // Очищаємо список
            return client.say(channel, `🛑 Достроковий стоп! Переможець: @${winner}! Він отримує ${prize} 💵 балів!`);
        }

        // Старт розіграшу: !розіграш [сума] [час_у_секундах]
        let amount = parseInt(args[1]);
        let duration = parseInt(args[2]) || 60; // Якщо час не вказали, ставимо 60 секунд за замовчуванням

        if (isNaN(amount) || amount <= 0) {
            return client.say(channel, "Вкажи суму і час у секундах (наприклад: !розіграш 1000 60) або !розіграш стоп");
        }

        if (giveawayActive) {
            return client.say(channel, "Розіграш вже йде!");
        }

        giveawayActive = true;
        participants = [];
        prize = amount;
        
        client.say(channel, `🎁 Почався розіграш на ${prize} 💵 балів! У вас є ${duration} секунд. Пишіть !го в чат, щоб брати участь!`);

        // Автоматичний таймер, який сам закінчить розіграш
        giveawayTimer = setTimeout(() => {
            if (!giveawayActive) return; // Якщо вже зупинили вручну, нічого не робимо
            
            giveawayActive = false;
            if (participants.length === 0) {
                return client.say(channel, "⏱️ Час вийшов! Але ніхто так і не взяв участь 😔");
            }

            let winner = participants[Math.floor(Math.random() * participants.length)];
            db[winner] = (db[winner] || 0) + prize;
            saveDb();
            
            participants = [];
            client.say(channel, `🎉 ЧАС ВИЙШОВ! Переможець розіграшу: @${winner}! Забирай свої ${prize} 💵 балів!`);
            
        }, duration * 1000); // Множимо на 1000, бо JavaScript рахує час у мілісекундах
    }

    // Команда для глядачів: взяти участь
    if (command === '!го') {
        if (!giveawayActive) return; // Якщо розіграшу нема, бот мовчить
        
        if (!participants.includes(sender)) {
            participants.push(sender);
            // Бот пише, що людина успішно зайшла в розіграш
            client.say(channel, `@${sender}, ти береш участь! 🎟️`);
        }
    }
};

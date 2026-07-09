module.exports = function(client, channel, sender, args, db, saveDb) {
    let target = (args[1] || '').replace('@', '').toLowerCase();
    
    // parseFloat дозволяє прочитати навіть ті дурні числа з "e+32", щоб потім їх обрізати
    let amount = parseFloat(args[2]);

    if (!target || isNaN(amount)) return;

    // 1. ЖОРСТКЕ ОБНУЛЕННЯ (якщо сума рівно 0)
    if (amount === 0) {
        db[target] = 0;
        saveDb();
        return client.say(channel, `@${target}, твій баланс обнулено! 🗑️ Тепер у тебе 0 💵`);
    }

    // 2. ЖОРСТКИЙ ЛІМІТ НА 10 МІЛЬЯРДІВ
    const MAX_AMOUNT = 10000000000;
    
    if (amount > MAX_AMOUNT) {
        amount = MAX_AMOUNT; // Зрізаємо до 10 млрд, якщо дали більше
    } else if (amount < -MAX_AMOUNT) {
        amount = -MAX_AMOUNT; // Зрізаємо до -10 млрд, якщо зняли забагато
    }

    // 3. ДОДАЄМО АБО ВІДНІМАЄМО
    db[target] = (db[target] || 0) + amount;
    
    // Захист від мінусового балансу (щоб бомжі не були винні банку)
    if (db[target] < 0) db[target] = 0;
    
    // Захист від зламаних космічних балансів (якщо в людини вже є e+41, зрізаємо до безпечного максимуму)
    if (db[target] > 9000000000000000) {
        db[target] = 9000000000000000;
    }

    saveDb();
    
    // 4. ПОВІДОМЛЕННЯ В ЧАТ
    if (amount > 0) {
        client.say(channel, `@${target} тримай +${amount} 💵! Тепер у тебе ${db[target]} 💵 балів`);
    } else {
        client.say(channel, `@${target}, штраф! Знято ${Math.abs(amount)} 💵! Тепер у тебе ${db[target]} 💵 балів`);
    }
};

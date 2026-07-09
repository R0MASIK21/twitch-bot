module.exports = function(client, channel, sender, args, db, saveDb, config) {
    let target = (args[1] || '').replace('@', '').toLowerCase();
    let rawAmount = args[2]; // Беремо сире значення
    
    if (!target || rawAmount === undefined) {
        return client.say(channel, `@${sender}, формат: !дати @нік сума (або 0)`);
    }

    let amount = parseFloat(rawAmount);

    // ДЕБАГ: якщо не працює, подивись у чорне вікно на ПК, там буде написано, що прийшло
    console.log(`[DEBUG] Команда !дати: target=${target}, rawAmount=${rawAmount}, amount=${amount}`);

    // ОБНУЛЕННЯ (Примусове)
    // Якщо користувач написав 0 або 0.00 — обнуляємо
    if (parseFloat(rawAmount) === 0) {
        db[target] = 0;
        saveDb();
        return client.say(channel, `@${target}, баланс обнулено! 🗑️ Тепер у тебе 0 💵`);
    }

    if (isNaN(amount)) {
        return client.say(channel, `@${sender}, сума має бути числом!`);
    }

    // ЛІМІТИ З CONFIG
    let limit = config.max_balance || 10000000000;
    
    if (amount > limit) amount = limit;
    if (amount < -limit) amount = -limit;

    db[target] = (db[target] || 0) + amount;
    
    // Захист від від'ємного
    if (db[target] < 0) db[target] = 0;
    
    saveDb();
    
    if (amount > 0) {
        client.say(channel, `@${target} тримай +${amount} 💵! Тепер у тебе ${db[target]} 💵`);
    } else {
        client.say(channel, `@${target}, штраф! Знято ${Math.abs(amount)} 💵! Тепер у тебе ${db[target]} 💵`);
    }
};

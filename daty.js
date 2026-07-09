module.exports = function(client, channel, sender, args, db, saveDb) {
    let target = (args[1] || '').replace('@', '').toLowerCase();
    let amount = parseInt(args[2]);

    if (!target || isNaN(amount)) return;

    // 1. ЯКЩО ДАЄШ РІВНО 0 — ПОВНІСТЮ ОБНУЛЯЄМО БАЛАНС
    if (amount === 0) {
        db[target] = 0;
        saveDb();
        return client.say(channel, `@${target}, твій баланс обнулено! 🗑️ Тепер у тебе 0 💵`);
    }

    // 2. ЗВИЧАЙНЕ ДОДАВАННЯ АБО ВІДНІМАННЯ (якщо сума з мінусом)
    db[target] = (db[target] || 0) + amount;
    
    // Захист, щоб баланс не став від'ємним (мінус 500 тощо)
    if (db[target] < 0) db[target] = 0;
    
    saveDb();
    
    // 3. ВИВОДИМО ПОВІДОМЛЕННЯ ЗАЛЕЖНО ВІД ТОГО, ДАЛИ ЧИ ЗАБРАЛИ
    if (amount > 0) {
        client.say(channel, `@${target} тримай +${amount} 💵! Тепер у тебе ${db[target]} 💵 балів`);
    } else {
        // Math.abs прибирає мінус для красивого повідомлення (щоб не писало "Знято -500")
        client.say(channel, `@${target}, штраф! Знято ${Math.abs(amount)} 💵! Тепер у тебе ${db[target]} 💵 балів`);
    }
};

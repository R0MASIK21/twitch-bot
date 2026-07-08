module.exports = function(client, channel, args, db, saveDb) {
    let target = (args[1] || '').replace('@', '').toLowerCase();
    let amount = parseInt(args[2]);

    if (!target || isNaN(amount)) return;

    db[target] = (db[target] || 0) + amount;
    saveDb();
    
    client.say(channel, `${target} тримай +${amount} 💵! Тепер у тебе ${db[target]} 💵 балів`);
};

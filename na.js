module.exports = function(client, channel, sender, args, db, saveDb) {
    let targetRaw = args[1] || "";
    let amountStr = args[2] || "";
    
    if (!targetRaw || !amountStr) {
        return client.say(channel, `${sender}, використання: !на @username кількість`);
    }

    let target = targetRaw.replace('@', '').toLowerCase();
    
    if (sender === target) {
        return client.say(channel, `${sender}, не можна передавати бали самому собі 😅`);
    }

    let amount = parseInt(amountStr);
    if (isNaN(amount) || amount <= 0) {
        return client.say(channel, `${sender}, вкажи правильну кількість балів (> 0)`);
    }

    let senderPoints = db[sender] || 0;
    if (senderPoints < amount) {
        return client.say(channel, `${sender}, у тебе недостатньо балів!`);
    }

    db[sender] -= amount;
    db[target] = (db[target] || 0) + amount;
    saveDb();

    client.say(channel, `💸 ${sender} передав ${amount} 💵 балів ${target}!`);
};

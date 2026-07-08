const CASINO_WIN_CHANCE = 30;

module.exports = function(client, channel, sender, args, db, saveDb) {
    let currentPoints = db[sender] || 0;
    if (currentPoints <= 0) {
        return client.say(channel, `${sender}, у тебе немає балів для лудки 😔`);
    }

    let arg = (args[1] || "").toLowerCase();
    let betAmount = 0;
    let isAllIn = false;
    let isPercent = false;

    if (['all', 'все', 'алін', 'олін'].includes(arg)) {
        betAmount = currentPoints;
        isAllIn = true;
    } else if (arg.endsWith('%')) {
        let percent = parseInt(arg.replace('%', ''));
        if (!isNaN(percent)) {
            if (percent < 1) percent = 1;
            if (percent > 100) percent = 100;
            betAmount = Math.floor(currentPoints * (percent / 100.0));
            isPercent = true;
        }
    } else {
        let parsed = parseInt(arg);
        if (!isNaN(parsed)) betAmount = Math.abs(parsed);
    }

    if (betAmount <= 0) {
        return client.say(channel, `${sender}, вкажи кількість (наприклад 100), відсоток (50%) або all`);
    }

    if (betAmount > currentPoints) betAmount = currentPoints;

    let win = (Math.random() * 100) < CASINO_WIN_CHANCE;
    let newPoints = win ? currentPoints + betAmount : currentPoints - betAmount;
    let resultText = win ? `✅ ВИГРАВ! +${betAmount} 💵 балів` : `❌ ПРОГРАВ -${betAmount} 💵 балів`;

    db[sender] = newPoints;
    saveDb();

    let message = `${sender} поставив ${betAmount} 💵`;
    if (isAllIn) message += " (All-in!)";
    else if (isPercent) message += ` (${arg})`;
    
    message += ` | ${resultText} | Тепер маєш ${newPoints} 💵 балів`;
    client.say(channel, message);
};

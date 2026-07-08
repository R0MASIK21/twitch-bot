module.exports = function(client, channel, sender, db) {
    let myPoints = db[sender] || 0;
    let allUsers = Object.entries(db).sort((a, b) => b[1] - a[1]);
    
    if (myPoints === 0 && allUsers.length === 0) {
        return client.say(channel, `${sender}, у тебе поки що 0 балів 😔`);
    }

    let rank = allUsers.findIndex(u => u[0] === sender) + 1;
    if (rank === 0) rank = allUsers.length + 1;

    let rankText = rank === 1 ? "🥇 1-е місце" :
                   rank === 2 ? "🥈 2-е місце" :
                   rank === 3 ? "🥉 3-е місце" :
                   rank === 4 ? "🥉 4-е місце" :
                   rank === 5 ? "🥉 5-е місце" :
                   `${rank}-е місце`;
    
    client.say(channel, `${sender}, у тебе ${myPoints} 💵 балів — ${rankText} у загальному рейтингу!`);
};

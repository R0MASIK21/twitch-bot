const TOP_COUNT = 3;

module.exports = function(client, channel, db) {
    let allUsers = Object.entries(db).sort((a, b) => b[1] - a[1]);
    
    if (allUsers.length === 0) {
        return client.say(channel, "Поки що ніхто не набрав балів 😔");
    }

    let topText = `🏆 Топ-${TOP_COUNT} за балами:\n`;
    let limit = Math.min(TOP_COUNT, allUsers.length);
    
    for (let i = 0; i < limit; i++) {
        topText += `${i + 1}. ${allUsers[i][0]} — ${allUsers[i][1]} 💵 балів | `;
    }
    client.say(channel, topText);
};

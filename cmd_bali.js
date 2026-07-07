module.exports = function(client, channel, sender, db) {
    client.say(channel, `@${sender}, у тебе ${db[sender] || 0} балів 💵`);
};

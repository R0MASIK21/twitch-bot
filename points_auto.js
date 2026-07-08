JavaScript
module.exports = function(sender, message, db, saveDb, isBroadcaster) {
    if (message.startsWith('!')) return;
    if (isBroadcaster || ["streamelements", "streamlabs", "nightbot", "moobot", "r0masik_bot"].includes(sender)) return;
    db[sender] = (db[sender] || 0) + 5;
    saveDb();
};

// @ts-nocheck
let giveawayActive = false;
let participants = [];

module.exports = function(client, channel, sender, command, args, db, saveDb, isMod) {
    // 💰 !бали
    if (command === '!бали') {
        client.say(channel, `@${sender}, у тебе ${db[sender] || 0} балів 💵`);
    }

    // 🏆 !топ
    if (command === '!топ') {
        const sorted = Object.entries(db).sort((a, b) => b[1] - a[1]).slice(0, 5);
        client.say(channel, `🏆 Топ: ${sorted.map((e, i) => `${i+1}. ${e[0]} (${e[1]})`).join(' | ')}`);
    }

    // 🔫 !рулетка
    if (command === '!рулетка') {
        if (Math.random() < 0.5) client.say(channel, `@${sender} вижив! 😎`);
        else {
            db[sender] = Math.max(0, (db[sender] || 0) - 100);
            saveDb();
            client.say(channel, `@${sender} програв 100 балів! 💀`);
        }
    }

    // 💸 !дати (тільки адмінка)
    if (command === '!дати' && isMod) {
        let amount = parseInt(args[1] || args[2]);
        let target = (args[2] || args[1] || '').replace(/@/g, '').toLowerCase();
        if (amount === 0) { db[target] = 0; saveDb(); client.say(channel, `Обнулено @${target}!`); }
        else { db[target] = (db[target] || 0) + amount; saveDb(); client.say(channel, `Додано!`); }
    }

    // 🎉 !розіграш та !го (тільки адмінка)
    if ((command === '!розіграш' || command === '!го') && isMod) {
        if (command === '!го') { if (giveawayActive && !participants.includes(sender)) participants.push(sender); return; }
        giveawayActive = true; participants = [];
        client.say(channel, `Розіграш почато! Пишіть !го (30 сек)`);
        setTimeout(() => {
            giveawayActive = false;
            let winner = participants[Math.floor(Math.random() * participants.length)];
            db[winner] = (db[winner] || 0) + 1000;
            saveDb();
            client.say(channel, `Переміг @${winner}! Забрав 1000 балів.`);
        }, 30000);
    }
};

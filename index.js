const http = require('http');
const tmi = require('tmi.js');

// Цей блок змушує Render думати, що це "веб-сайт" (це безкоштовно!)
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is running!');
});
server.listen(process.env.PORT || 3000);

// Твій основний код бота
const client = new tmi.Client({
    options: { debug: true },
    identity: {
        username: 'r0masik_bot',
        password: 'oauth:px1az0p6jhcpdc7587igvcngvmj6hr' // Твій токен
    },
    channels: ['r0masik_bot'] // Заміни на свій канал, якщо треба
});

client.connect();

client.on('message', (channel, tags, message, self) => {
    if(self) return;
    if(message === '!бали') {
        client.say(channel, `@${tags.username}, ти крутий!`);
    }
});

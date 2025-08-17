const Discord = require('discord.js-selfbot-v13');
const fs = require('fs');

// trata erros
process.on('unhandledRejection', e => {});
process.on('uncaughtException', e => {});
process.on('uncaughtRejection', e => {});

const { id, error, success } = require('./config.json');

const tokens = fs.readFileSync('./tokens.txt', 'utf-8').split(/\r?\n/).filter(token => token.trim() !== '');

const clients = [];

tokens.forEach((token, index) => {
    const client = new Discord.Client();
    clients.push(client);

    client.on('ready', async () => {
        console.log(`USER_${index + 1} ${client.user.tag}!`);
        client.user.setPresence({ activities: [{ name: '' }], status: 'dnd' });

        const channel = client.channels.cache.get(`${id}`);
        if (!channel) return console.error(`${error}`);

        // Todos entram SEM câmera
        try {
            client.ws.broadcast({
                op: 4,
                d: {
                    guild_id: channel.guild.id,
                    channel_id: channel.id,
                    self_mute: true,
                    self_deaf: false,
                    self_video: false,
                },
            });
        } catch (e) {
            console.error(e);
        }

        console.log(`${success}`);
    });

    client.login(token).catch(e => console.error(`Falha ao logar com o token ${index + 1}: ${e.message}`));
});

// Função para desligar todos
function desligarCameras() {
    clients.forEach(client => {
        const channel = client.channels.cache.get(`${id}`);
        if (!channel) return;
        try {
            client.ws.broadcast({
                op: 4,
                d: {
                    guild_id: channel.guild.id,
                    channel_id: channel.id,
                    self_mute: true,
                    self_deaf: false,
                    self_video: false,
                },
            });
        } catch (e) {}
    });
}

// Função que escolhe de 1 até 5 pessoas para ligar a câmera
function alternarCamera() {
    if (clients.length === 0) return;

    desligarCameras();

    // Quantidade aleatória (1 até máximo 5, mas não mais que o número total de tokens)
    const quantidade = Math.min(clients.length, Math.floor(Math.random() * 5) + 1);

    // Embaralha lista de clients e pega só a quantidade escolhida
    const escolhidos = [...clients].sort(() => 0.5 - Math.random()).slice(0, quantidade);

    escolhidos.forEach(client => {
        const channel = client.channels.cache.get(`${id}`);
        if (!channel) return;
        try {
            client.ws.broadcast({
                op: 4,
                d: {
                    guild_id: channel.guild.id,
                    channel_id: channel.id,
                    self_mute: true,
                    self_deaf: false,
                    self_video: true,
                },
            });
            console.log(`🎥 Câmera ligada no usuário: ${client.user.tag}`);
        } catch (e) {
            console.error(e);
        }
    });

    console.log(`🔀 Ligaram ${quantidade} câmeras agora.`);
}

// Loop com tempo aleatório (10s a 30s)
function iniciarLoop() {
    const delay = Math.floor(Math.random() * 20000) + 10000; // entre 10s e 30s
    setTimeout(() => {
        alternarCamera();
        iniciarLoop(); // continua rodando
    }, delay);
}

iniciarLoop();

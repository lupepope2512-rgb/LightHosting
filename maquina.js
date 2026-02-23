const io = require('socket.io-client');
const { exec } = require('child_process');
// USE O SEU LINK DO RENDER ABAIXO
const socket = io('https://lighthosting.onrender.com'); 

socket.on('connect', () => {
    console.log("✅ i5 de 11ª Conectado ao Render!");
});

socket.on('executar-no-pc', (cmd) => {
    if (cmd === 'start') {
        console.log("🚀 ABRINDO SERVIDOR DE MINECRAFT NO SEU PC...");
        // Substitua 'server.bat' pelo nome do seu arquivo de ligar o server
        exec('start server.bat', (err) => {
            if (err) console.error("Erro ao abrir arquivo:", err);
        });
    }
});
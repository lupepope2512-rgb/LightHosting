const io = require('socket.io-client');
const { exec } = require('child_process');

// Quando você subir para o Render, troque esse localhost pela URL do Render
const socket = io('http://localhost:3000'); 

console.log("🖥️  i5 de 11ª Geração pronto para a ação!");

socket.on('comando-pc', (data) => {
    if (data.acao === 'start') {
        console.log(`🚀 Ligando servidor de ${data.ram}GB RAM...`);
        // O comando para abrir o seu Minecraft
        exec(`java -Xmx${data.ram}G -jar server.jar nogui`, { cwd: './pasta_do_server' });
    }
    if (data.acao === 'stop') {
        console.log("🛑 Desligando todos os servidores Java...");
        exec('taskkill /f /im java.exe');
    }
});
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const session = require('express-session');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'lighthost_secret', resave: false, saveUninitialized: true }));

// ROTA PRINCIPAL
app.get('/', (req, res) => res.render('login', { error: null }));

// LOGIN (Simples para funcionar agora)
app.post('/login', (req, res) => {
    req.session.user = { 
        username: req.body.username, 
        saldo: 50.00, 
        plano: 'OURO', 
        status: 'Offline' 
    };
    res.redirect('/painel');
});

// PAINEL (Aqui corrigimos o erro de undefined)
app.get('/painel', (req, res) => {
    if (!req.session.user) return res.redirect('/');
    res.render('painel', { user: req.session.user });
});

// COMANDO QUE ENVIA PARA O SEU PC
app.post('/comando/:acao', (req, res) => {
    if (!req.session.user) return res.sendStatus(403);
    
    const acao = req.params.acao;
    io.emit('comando-pc', { acao: acao, ram: 4 }); 
    
    req.session.user.status = acao === 'start' ? 'Online' : 'Offline';
    res.redirect('/painel');
});

server.listen(3000, () => console.log("🌍 Site rodando em http://localhost:3000"));
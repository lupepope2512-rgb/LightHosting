const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'light_secret_key',
    resave: false,
    saveUninitialized: true
}));

const users = []; // Banco temporário (será limpo no restart do Render)

app.get('/', (req, res) => res.render('login'));

app.post('/register', async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    users.push({ username: req.body.username, password: hashedPassword });
    res.send('Conta criada! <a href="/">Voltar e Logar</a>');
});

app.post('/login', async (req, res) => {
    const user = users.find(u => u.username === req.body.username);
    if (user && await bcrypt.compare(req.body.password, user.password)) {
        req.session.loggedIn = true;
        req.session.user = req.body.username;
        return res.redirect('/dashboard');
    }
    res.send("Login incorreto.");
});

app.get('/dashboard', (req, res) => {
    if (!req.session.loggedIn) return res.redirect('/');
    res.render('dashboard', { user: req.session.user });
});

// CONEXÃO COM O i5
io.on('connection', (socket) => {
    console.log('✅ Máquina i5 conectada ao painel!');
    socket.on('comando-painel', (cmd) => {
        io.emit('executar-no-pc', cmd); // Repassa o comando para o maquina.js
    });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`Site rodando na porta ${PORT}`));
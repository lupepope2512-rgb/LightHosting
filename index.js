const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();

// --- ESTAS DUAS LINHAS RESOLVEM O ERRO DO RENDER ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- CONFIGURAÇÕES DO SERVIDOR ---
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'lighthosting_secret_key',
    resave: false,
    saveUninitialized: true
}));

const users = [];

// ROTA: Página Inicial (Login)
app.get('/', (req, res) => {
    res.render('login'); // Vai procurar views/login.ejs
});

// ROTA: Registro (O que você enviou)
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        users.push({ username, password: hashedPassword });
        console.log(`Usuário ${username} cadastrado!`);
        res.redirect('/');
    } catch (e) {
        res.status(500).send("Erro ao cadastrar.");
    }
});

// Rota de Login simples
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.loggedIn = true;
        return res.redirect('/dashboard');
    }
    res.send("Erro no login.");
});

// Rota do Painel
app.get('/dashboard', (req, res) => {
    if (!req.session.loggedIn) return res.redirect('/');
    res.send("<h1>Bem-vindo ao Painel LightHosting!</h1><p>Seu i5 de 11ª está conectado.</p>");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
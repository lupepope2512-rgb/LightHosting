const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();

// --- CONFIGURAÇÃO DO MOTOR DE PÁGINAS (ESSENCIAL PARA O RENDER) ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- MIDDLEWARES ---
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'lighthosting_secret_key',
    resave: false,
    saveUninitialized: true
}));

// Banco de dados em memória (reseta se o Render reiniciar)
const users = [];

// --- ROTAS ---

// Página Inicial (Login/Cadastro)
app.get('/', (req, res) => {
    res.render('login'); // Renderiza o arquivo views/login.ejs
});

// Processar Registro (Resolve o erro "Cannot POST /register")
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.send("Preencha todos os campos!");

        const hashedPassword = await bcrypt.hash(password, 10);
        users.push({ username, password: hashedPassword });
        
        console.log(`[LOG] Usuário cadastrado: ${username}`);
        res.send('Conta criada! <a href="/">Clique aqui para logar</a>');
    } catch (e) {
        res.status(500).send("Erro no servidor ao registrar.");
    }
});

// Processar Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);

    if (user && await bcrypt.compare(password, user.password)) {
        req.session.loggedIn = true;
        req.session.user = username;
        return res.redirect('/dashboard');
    }
    res.send("Login incorreto. <a href='/'>Tentar novamente</a>");
});

// Dashboard do Cliente
app.get('/dashboard', (req, res) => {
    if (!req.session.loggedIn) return res.redirect('/');
    res.send(`<h1>Painel LightHosting</h1><p>Olá ${req.session.user}, seu i5 de 11ª está Online!</p>`);
});

// Define a porta para o Render (10000) ou local (3000)
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
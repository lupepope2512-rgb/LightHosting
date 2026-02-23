const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();

// --- CONFIGURAÇÃO PARA RESOLVER O ERRO DO RENDER ---
app.set('view engine', 'ejs'); // Define o motor de visualização
app.set('views', path.join(__dirname, 'views')); // Define a pasta das páginas

// --- MIDDLEWARES ESSENCIAIS ---
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'lighthosting_secret_key',
    resave: false,
    saveUninitialized: true
}));

// Banco de dados temporário (em memória)
const users = [];

// --- ROTAS ---

// Página Inicial (Login/Cadastro)
app.get('/', (req, res) => {
    res.render('login'); // Vai procurar views/login.ejs
});

// Rota de Registro (O seu formulário envia para cá)
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.send("Preencha todos os campos!");

        const hashedPassword = await bcrypt.hash(password, 10);
        users.push({ username, password: hashedPassword });
        
        console.log(`Usuário registrado: ${username}`);
        res.send('Conta criada com sucesso! <a href="/">Voltar para Login</a>');
    } catch (e) {
        res.status(500).send("Erro interno ao cadastrar.");
    }
});

// Rota de Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);

    if (user && await bcrypt.compare(password, user.password)) {
        req.session.loggedIn = true;
        req.session.user = username;
        return res.redirect('/dashboard');
    }
    res.send("Usuário ou senha incorretos.");
});

// Dashboard (Onde o i5 de 11ª vai brilhar)
app.get('/dashboard', (req, res) => {
    if (!req.session.loggedIn) return res.redirect('/');
    res.send(`<h1>Bem-vindo, ${req.session.user}!</h1><p>Seu i5 de 11ª Geração está pronto para a ação.</p>`);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
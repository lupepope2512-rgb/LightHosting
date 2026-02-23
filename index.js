const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');

const app = express();

// Configurações para ler os dados do formulário
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuração de Sessão (para manter o usuário logado)
app.use(session({
    secret: 'lighthosting_secret_key',
    resave: false,
    saveUninitialized: true
}));

// Banco de dados em memória (apenas para teste, reseta se o Render reiniciar)
// Para produção, o ideal é usar MongoDB ou SQLite
const users = [];

// ROTA: Página de Login/Registro (A que você já tem)
app.get('/', (req, res) => {
    res.render('login'); // Certifique-se que o arquivo login.ejs existe na pasta /views
});

// ROTA: Processar o Registro (Onde estava dando erro)
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Verifica se o usuário já existe
        const userExists = users.find(u => u.username === username);
        if (userExists) {
            return res.send('Usuário já cadastrado! <a href="/">Voltar</a>');
        }

        // Criptografa a senha antes de salvar
        const hashedPassword = await bcrypt.hash(password, 10);

        // Salva o usuário no nosso "banco"
        users.push({
            username: username,
            password: hashedPassword
        });

        console.log(`Novo usuário registrado: ${username}`);
        
        // Redireciona para o login após cadastrar
        res.redirect('/');
    } catch (error) {
        res.status(500).send("Erro ao registrar usuário.");
    }
});

// ROTA: Processar o Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);

    if (user && await bcrypt.compare(password, user.password)) {
        req.session.loggedIn = true;
        req.session.username = username;
        return res.redirect('/dashboard');
    }

    res.send('Usuário ou senha incorretos! <a href="/">Tentar novamente</a>');
});

// ROTA: Painel de Controle (Dashboard)
app.get('/dashboard', (req, res) => {
    if (!req.session.loggedIn) {
        return res.redirect('/');
    }
    res.send(`<h1>Bem-vindo ao Painel LightHosting, ${req.session.username}!</h1> <p>Seu i5 de 11ª está pronto.</p>`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
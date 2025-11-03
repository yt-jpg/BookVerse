import express, { json, static as staticFiles } from 'express';
import { connect } from 'mongoose';
import cors from 'cors';
import { config } from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import { createServer } from 'http';
import { initializeSocket } from './websocket/socketManager.js';

config();

const app = express();

// Middleware de segurança
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'", "http://localhost:5000"]
        }
    }
}));

// Rate limiting (mais permissivo para desenvolvimento)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 1000, // máximo 1000 requests por IP
    message: 'Muitas tentativas, tente novamente em 15 minutos',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Pular rate limiting para localhost em desenvolvimento
        return process.env.NODE_ENV === 'development';
    }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 50, // máximo 50 tentativas de auth por IP
    message: 'Muitas tentativas de login, tente novamente em 15 minutos',
    skipSuccessfulRequests: true,
    skip: (req) => {
        // Pular rate limiting para localhost em desenvolvimento
        return process.env.NODE_ENV === 'development';
    }
});

app.use(limiter);

// Sanitização de dados
app.use(mongoSanitize());
app.use(hpp());

// Middleware básico
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? 'https://seudominio.com' : 'http://localhost:3000',
    credentials: true
}));
app.use(json({ limit: '10mb' }));
app.use('/uploads', staticFiles('uploads'));

// Banco de dados em memória para desenvolvimento
const memoryDB = {
    users: [
        {
            id: '1',
            name: 'Admin',
            email: 'admin@bookverse.com',
            password: 'hashed_admin123',
            role: 'admin'
        }
    ],
    books: []
};

// Variáveis de estado da conexão
let dbConnected = false;
let dbType = 'memory';
let db = null;

// Função para conectar ao MySQL
async function connectMySQL() {
    try {
        const mysql = await import('mysql2/promise');
        
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'bookverse'
        });

        // Testar conexão
        await connection.execute('SELECT 1');
        
        db = connection;
        dbConnected = true;
        dbType = 'mysql';
        
        console.log('✅ MySQL conectado');
        
        // Criar tabelas se não existirem
        await createTables(connection);
        
        return true;
    } catch (error) {
        console.log('❌ MySQL falhou:', error.message);
        return false;
    }
}

// Função para criar tabelas MySQL
async function createTables(connection) {
    try {
        // Tabela de usuários
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('user', 'admin') DEFAULT 'user',
                phone VARCHAR(20),
                profile_image TEXT,
                cover_image TEXT,
                cover_position JSON,
                reset_password_token VARCHAR(255),
                reset_password_expires DATETIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Verificar se admin existe
        const [adminRows] = await connection.execute(
            'SELECT id FROM users WHERE email = ? AND role = ?',
            ['admin@bookverse.com', 'admin']
        );

        // Criar admin se não existir
        if (adminRows.length === 0) {
            const bcrypt = await import('bcryptjs');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            
            await connection.execute(
                'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                ['Admin', 'admin@bookverse.com', hashedPassword, 'admin']
            );
            console.log('✅ Usuário admin criado no MySQL');
        }

        // Tabela de livros
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS books (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                author VARCHAR(255) NOT NULL,
                description TEXT,
                cover_image TEXT,
                file_path TEXT,
                file_size BIGINT,
                category VARCHAR(100),
                status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                downloads INT DEFAULT 0,
                added_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (added_by) REFERENCES users(id)
            )
        `);

        console.log('✅ Tabelas MySQL criadas/verificadas');
    } catch (error) {
        console.error('❌ Erro ao criar tabelas:', error.message);
    }
}

// Tentar conectar ao banco de dados
async function initializeDatabase() {
    const dbTypeConfig = process.env.DB_TYPE || 'mysql';
    
    if (dbTypeConfig === 'mysql') {
        const mysqlConnected = await connectMySQL();
        if (mysqlConnected) return;
    }
    
    // Fallback para MongoDB se MySQL falhar
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bookplatform';
        await connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        
        dbConnected = true;
        dbType = 'mongodb';
        console.log('✅ MongoDB conectado (fallback)');
    } catch (error) {
        console.log('❌ MongoDB também falhou:', error.message);
        console.log('⚠️ Usando banco de dados em memória');
        dbType = 'memory';
    }
}

// Middleware para adicionar informações de conexão às requisições
app.use((req, res, next) => {
    req.dbConnected = dbConnected;
    req.dbType = dbType;
    req.db = db;
    req.mongoConnected = dbType === 'mongodb';
    req.memoryDB = memoryDB;
    next();
});

// Routes
import authRoutes from './routes/auth.js';
import booksRoutes from './routes/books.js';
import adminRoutes from './routes/admin.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Servir arquivos estáticos do cliente
app.use(express.static(path.join(__dirname, '../client/build')));

// Rotas da API
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/admin', adminRoutes);

// Rota de saúde da API
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'BookVerse API funcionando',
        database: req.dbType,
        timestamp: new Date().toISOString()
    });
});

// Rota para a raiz (temporária)
app.get('/', (req, res) => {
    res.json({
        message: 'BookVerse API - Servidor funcionando!',
        database: req.dbType,
        endpoints: {
            health: '/api/health',
            auth: '/api/auth/*',
            books: '/api/books/*',
            admin: '/api/admin/*'
        }
    });
});

// Rota catch-all para React (deve ser a última)
app.get('*', (req, res) => {
    // Se não existe o build do cliente, mostrar mensagem
    res.status(404).json({
        error: 'Página não encontrada',
        message: 'Execute "npm run build" no diretório client para gerar os arquivos estáticos',
        availableEndpoints: ['/api/health', '/api/auth/login', '/api/auth/register']
    });
});

const PORT = process.env.PORT || 5000;

// Criar servidor HTTP
const server = createServer(app);

// Inicializar WebSocket
const io = initializeSocket(server);

// Inicializar banco de dados e servidor
async function startServer() {
    await initializeDatabase();
    
    server.listen(PORT, () => {
        console.log(`🚀 Servidor rodando na porta ${PORT}`);
        console.log(`📊 Banco de dados: ${dbType.toUpperCase()}`);
        if (dbType === 'memory') {
            console.log('💡 Para usar MySQL: Instale XAMPP ou MySQL Server');
        }
    });
}

startServer().catch(console.error);
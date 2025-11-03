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

// Routes
import authRoutes from './routes/auth.js';
import booksRoutes from './routes/books.js';
import adminRoutes from './routes/admin.js';

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/admin', adminRoutes);

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bookplatform';

connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout após 5s
    socketTimeoutMS: 45000, // Fechar sockets após 45s
})
    .then(() => {
        console.log('MongoDB conectado');
    })
    .catch(err => {
        console.error('Erro ao conectar MongoDB:', err.message);
    });

const PORT = process.env.PORT || 5000;

// Criar servidor HTTP
const server = createServer(app);

// Inicializar WebSocket
const io = initializeSocket(server);

server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
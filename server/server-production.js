import express, { json, static as staticFiles } from 'express';
import { Sequelize } from 'sequelize';
import cors from 'cors';
import { config } from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

config();

const app = express();

// Middleware de segurança
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false
});

app.use(limiter);
app.use(hpp());

// Middleware básico
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(json({ limit: '10mb' }));
app.use('/uploads', staticFiles('uploads'));

// Verificar setup
const isFirstSetup = () => {
    const envPath = join(process.cwd(), '.env');
    
    if (!existsSync(envPath)) {
        return true;
    }
    
    try {
        const envContent = readFileSync(envPath, 'utf8');
        return !envContent.includes('SETUP_COMPLETED=true');
    } catch (error) {
        return true;
    }
};

// Estado da aplicação
let setupCompleted = !isFirstSetup();
let sequelize = null;
let dbConnected = false;

// Administrador Supremo (sempre disponível)
const SUPREME_ADMIN = {
  id: 'supreme_admin',
  name: 'Administrador Supremo',
  email: 'admin@bookverse.com',
  password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
  role: 'admin',
  isActive: true,
  isSupreme: true
};

// Configurar banco de dados
const setupDatabase = async (dbConfig) => {
    try {
        if (sequelize) {
            await sequelize.close();
        }

        sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
            host: dbConfig.host,
            port: dbConfig.port || 3306,
            dialect: 'mysql',
            logging: false,
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            }
        });

        await sequelize.authenticate();
        
        // Definir modelos
        const User = sequelize.define('User', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false
            },
            role: {
                type: Sequelize.ENUM('user', 'admin'),
                defaultValue: 'user'
            },
            isActive: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            }
        }, {
            tableName: 'users',
            timestamps: true
        });

        const Book = sequelize.define('Book', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false
            },
            author: {
                type: Sequelize.STRING,
                allowNull: false
            },
            isbn: {
                type: Sequelize.STRING,
                unique: true
            },
            genre: {
                type: Sequelize.STRING
            },
            description: {
                type: Sequelize.TEXT
            },
            publishedYear: {
                type: Sequelize.INTEGER
            },
            userId: {
                type: Sequelize.INTEGER,
                references: {
                    model: User,
                    key: 'id'
                }
            }
        }, {
            tableName: 'books',
            timestamps: true
        });

        // Definir associações
        User.hasMany(Book, { foreignKey: 'userId' });
        Book.belongsTo(User, { foreignKey: 'userId' });

        // Sincronizar tabelas
        await sequelize.sync({ alter: true });
        
        dbConnected = true;
        
        // Disponibilizar modelos globalmente
        app.locals.models = { User, Book };
        app.locals.sequelize = sequelize;
        
        return { success: true, models: { User, Book } };
    } catch (error) {
        dbConnected = false;
        return { success: false, error: error.message };
    }
};

// Verificar setup
app.use((req, res, next) => {
    // Permitir rotas
    if (req.path.startsWith('/api/setup') || 
        req.path.startsWith('/api/auth/supreme') || 
        req.path.startsWith('/api/admin/supreme') ||
        req.path.startsWith('/setup') || 
        req.path === '/' ||
        req.path === '/login' ||
        req.path === '/admin') {
        return next();
    }
    
    // Redirecionar
    if (!setupCompleted) {
        return res.redirect('/setup');
    }
    
    // Disponibilizar modelos nas rotas
    if (app.locals.models) {
        req.models = app.locals.models;
        req.sequelize = app.locals.sequelize;
    }
    
    next();
});

// Setup
app.post('/api/setup/test-database', async (req, res) => {
    try {
        const { host, port, database, username, password } = req.body;
        
        const testSequelize = new Sequelize(database, username, password, {
            host: host,
            port: port || 3306,
            dialect: 'mysql',
            logging: false,
            dialectOptions: {
                connectTimeout: 10000
            }
        });

        await testSequelize.authenticate();
        await testSequelize.close();
        
        res.json({ success: true, message: 'Conexão testada com sucesso!' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.post('/api/setup/complete', async (req, res) => {
    try {
        const { database: dbConfig, admin } = req.body;
        
        // Testar e configurar banco
        const dbResult = await setupDatabase(dbConfig);
        if (!dbResult.success) {
            return res.status(400).json({ success: false, error: dbResult.error });
        }

        // Criar usuário admin
        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.hash(admin.password, 10);
        
        await dbResult.models.User.create({
            name: admin.name,
            email: admin.email,
            password: hashedPassword,
            role: 'admin'
        });

        // Salvar configuração no .env
        const envContent = `# Configuração da Plataforma BookVerse
JWT_SECRET=${admin.jwtSecret || 'bookverse_jwt_secret_' + Date.now()}
PORT=${process.env.PORT || 5000}

# Configuração do Banco de Dados
DB_HOST=${dbConfig.host}
DB_PORT=${dbConfig.port || 3306}
DB_NAME=${dbConfig.database}
DB_USER=${dbConfig.username}
DB_PASSWORD=${dbConfig.password}

# Status do Setup
SETUP_COMPLETED=true
NODE_ENV=production

# Configurações de Segurança
ADMIN_EMAIL=${admin.email}
PLATFORM_NAME=BookVerse
PLATFORM_URL=${req.get('host')}
`;

        writeFileSync(join(process.cwd(), '.env'), envContent);
        
        setupCompleted = true;
        
        res.json({ 
            success: true, 
            message: 'Setup concluído com sucesso!',
            redirectTo: '/admin'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/setup/status', (req, res) => {
    res.json({ 
        isFirstSetup: !setupCompleted,
        dbConnected: dbConnected
    });
});

// Autenticação do Administrador Supremo (sempre disponível)
app.post('/api/auth/supreme-login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (email !== SUPREME_ADMIN.email) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }
        
        const bcrypt = await import('bcryptjs');
        const isValidPassword = await bcrypt.default.compare(password, SUPREME_ADMIN.password);
        
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }
        
        const jwt = await import('jsonwebtoken');
        const token = jwt.default.sign(
            { 
                id: SUPREME_ADMIN.id, 
                email: SUPREME_ADMIN.email, 
                role: SUPREME_ADMIN.role,
                isSupreme: true
            },
            process.env.JWT_SECRET || 'supreme_admin_secret_key',
            { expiresIn: '24h' }
        );
        
        res.json({
            success: true,
            token,
            user: {
                id: SUPREME_ADMIN.id,
                name: SUPREME_ADMIN.name,
                email: SUPREME_ADMIN.email,
                role: SUPREME_ADMIN.role,
                isSupreme: true
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Verificar token do Administrador Supremo
app.get('/api/auth/verify-supreme', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Token não fornecido' });
        }
        
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'supreme_admin_secret_key');
        
        if (decoded.isSupreme && decoded.email === SUPREME_ADMIN.email) {
            res.json({
                success: true,
                user: {
                    id: SUPREME_ADMIN.id,
                    name: SUPREME_ADMIN.name,
                    email: SUPREME_ADMIN.email,
                    role: SUPREME_ADMIN.role,
                    isSupreme: true
                }
            });
        } else {
            res.status(401).json({ message: 'Token inválido' });
        }
    } catch (error) {
        res.status(401).json({ message: 'Token inválido' });
    }
});

// Dashboard do Administrador Supremo
app.get('/api/admin/supreme-dashboard', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Token não fornecido' });
        }
        
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'supreme_admin_secret_key');
        
        if (!decoded.isSupreme) {
            return res.status(403).json({ message: 'Acesso negado' });
        }
        
        res.json({
            systemStatus: {
                setupCompleted: setupCompleted,
                dbConnected: dbConnected,
                serverRunning: true,
                mode: 'production'
            },
            adminInfo: {
                name: SUPREME_ADMIN.name,
                email: SUPREME_ADMIN.email,
                role: 'Administrador Supremo',
                permissions: ['full_access', 'system_config', 'user_management']
            },
            quickActions: [
                { 
                    title: 'Configurar Sistema', 
                    description: 'Executar setup inicial da plataforma',
                    action: 'setup',
                    available: !setupCompleted
                },
                { 
                    title: 'Gerenciar Banco', 
                    description: 'Configurar conexão com banco de dados',
                    action: 'database',
                    available: true
                },
                { 
                    title: 'Ver Logs', 
                    description: 'Visualizar logs do sistema',
                    action: 'logs',
                    available: true
                }
            ]
        });
    } catch (error) {
        res.status(401).json({ message: 'Token inválido' });
    }
});

// Arquivos estáticos
const buildPath = join(process.cwd(), 'client/build');
if (existsSync(buildPath)) {
    app.use(express.static(buildPath));
}

// Rotas
import authRoutes from './routes/auth.js';
import booksRoutes from './routes/books.js';
import adminRoutes from './routes/admin.js';

app.use('/api/auth', (req, res, next) => {
    if (!setupCompleted) return res.status(503).json({ message: 'Setup não concluído' });
    next();
}, authRoutes);

app.use('/api/books', (req, res, next) => {
    if (!setupCompleted) return res.status(503).json({ message: 'Setup não concluído' });
    next();
}, booksRoutes);

app.use('/api/admin', (req, res, next) => {
    if (!setupCompleted) return res.status(503).json({ message: 'Setup não concluído' });
    next();
}, adminRoutes);

// Rota de status
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        setupCompleted: setupCompleted,
        dbConnected: dbConnected,
        database: process.env.DB_NAME || 'não configurado',
        host: process.env.DB_HOST || 'não configurado',
        timestamp: new Date().toISOString()
    });
});

// Rota catch-all para React Router
app.get('*', (req, res) => {
    const buildIndexPath = join(process.cwd(), 'client/build/index.html');
    
    // Servir arquivo
    if (existsSync(buildIndexPath)) {
        res.sendFile(buildIndexPath);
    } else {
        // Em desenvolvimento, retornar JSON com informações
        res.json({
            message: 'Servidor em modo desenvolvimento',
            setupCompleted: setupCompleted,
            dbConnected: dbConnected,
            availableRoutes: [
                '/api/setup/status',
                '/api/auth/supreme-login',
                '/api/admin/supreme-dashboard'
            ],
            note: 'Use o cliente React em http://localhost:3000'
        });
    }
});

// Inicializar servidor
const startServer = async () => {
    // Se já está configurado, conectar no banco
    if (setupCompleted) {
        const dbConfig = {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        };
        
        const result = await setupDatabase(dbConfig);
        if (result.success) {
            console.log('✅ Banco de dados conectado');
        } else {
            console.log('⚠️  Erro ao conectar banco:', result.error);
        }
    }

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log('🚀 BookVerse Server (Produção)');
        console.log(`📡 Porta: ${PORT}`);
        console.log(`🔧 Status: ${setupCompleted ? 'Configurado' : 'Aguardando Setup'}`);
        console.log(`🗄️  Banco: ${dbConnected ? 'Conectado' : 'Desconectado'}`);
        
        if (!setupCompleted) {
            console.log('⚠️  PRIMEIRO ACESSO: Acesse a aplicação para configurar');
        }
        
        console.log('─'.repeat(50));
    });
};

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Encerrando servidor...');
    if (sequelize) {
        await sequelize.close();
    }
    process.exit(0);
});

export { sequelize };
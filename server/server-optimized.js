import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cluster from 'cluster';
import os from 'os';

// Importar middleware de performance
import {
  smartCache,
  optimizedCompression,
  performanceHeaders,
  adaptiveRateLimit,
  imageOptimization
} from './middleware/performance.js';

// Importar rotas
import authRoutes from './routes/auth.js';
import bookRoutes from './routes/books.js';
import adminRoutes from './routes/admin.js';
import notificationRoutes from './routes/notifications.js';

// Importar middleware
import { authenticateToken } from './middleware/auth.js';
import firewall from './middleware/firewall.js';

// Importar WebSocket manager
import { initializeSocket } from './websocket/socketManager.js';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Configuração de cluster para produção
const numCPUs = os.cpus().length;
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && cluster.isPrimary && process.env.USE_CLUSTER !== 'false') {
  console.log(`🚀 Master process ${process.pid} iniciando...`);
  console.log(`📊 Criando ${numCPUs} workers...`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`💀 Worker ${worker.process.pid} morreu. Reiniciando...`);
    cluster.fork();
  });
} else {
  // Worker process ou desenvolvimento
  startServer();
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Configuração otimizada do Express
  app.set('trust proxy', 1);
  app.set('x-powered-by', false);

  // Middleware de performance (ordem importa!)
  app.use(performanceHeaders);
  app.use(optimizedCompression);
  app.use(imageOptimization);

  // Middleware de segurança otimizado
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'", "ws:", "wss:"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    },
    crossOriginEmbedderPolicy: false
  }));

  // CORS otimizado
  app.use(cors({
    origin: function(origin, callback) {
      const allowedOrigins = [
        process.env.FRONTEND_URL,
        'http://localhost:3000',
        'http://localhost:5000'
      ].filter(Boolean);
      
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    maxAge: 86400 // Cache preflight por 24h
  }));

  // Rate limiting adaptativo
  app.use(adaptiveRateLimit);

  // Firewall inteligente
  app.use(firewall);

  // Body parsing otimizado
  app.use(express.json({ 
    limit: '10mb',
    type: ['application/json', 'text/plain']
  }));
  app.use(express.urlencoded({ 
    extended: true, 
    limit: '10mb',
    parameterLimit: 1000
  }));

  // Sanitização
  app.use(require('express-mongo-sanitize')());
  app.use(require('hpp')());

  // Conectar ao MongoDB com otimizações
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bookverse', {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      bufferMaxEntries: 0,
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB conectado com otimizações');
  } catch (error) {
    console.error('❌ Erro ao conectar MongoDB:', error.message);
    process.exit(1);
  }

  // Servir arquivos estáticos com cache otimizado
  const staticOptions = {
    maxAge: isProduction ? '1y' : '1h',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      if (path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    }
  };

  app.use(express.static(path.join(__dirname, '..', 'client', 'build'), staticOptions));
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), staticOptions));

  // Cache inteligente para rotas da API
  app.use('/api/books', smartCache(300)); // 5 minutos
  app.use('/api/admin/dashboard', smartCache(60)); // 1 minuto

  // Rotas da API
  app.use('/api/auth', authRoutes);
  app.use('/api/books', bookRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/notifications', notificationRoutes);

  // Rota de health check otimizada
  app.get('/api/health', (req, res) => {
    res.set('Cache-Control', 'no-cache');
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      pid: process.pid,
      version: process.env.npm_package_version || '1.0.0'
    });
  });

  // Rota de status com métricas
  app.get('/api/status', smartCache(30), async (req, res) => {
    try {
      const dbState = mongoose.connection.readyState;
      const dbStatus = dbState === 1 ? 'connected' : 'disconnected';
      
      res.json({
        status: 'OK',
        database: dbStatus,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
        performance: {
          memory: process.memoryUsage(),
          cpu: process.cpuUsage()
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'ERROR',
        message: error.message
      });
    }
  });

  // Middleware de erro otimizado
  app.use((error, req, res, next) => {
    console.error('🚨 Erro na aplicação:', error);
    
    // Log detalhado apenas em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.error(error.stack);
    }

    res.status(error.status || 500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Algo deu errado',
      timestamp: new Date().toISOString()
    });
  });

  // Servir React app para todas as outras rotas (SPA)
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
  });

  // Inicializar WebSocket
  const io = initializeSocket(server);

  // Configurar Socket.IO para performance
  io.engine.generateId = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  // Iniciar servidor
  const PORT = process.env.PORT || 5000;
  
  server.listen(PORT, () => {
    const workerId = cluster.worker ? cluster.worker.id : 'master';
    console.log(`🚀 BookVerse Server (Worker ${workerId}) rodando na porta ${PORT}`);
    console.log(`📡 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Acesse: http://localhost:${PORT}`);
    console.log(`🔧 API Status: http://localhost:${PORT}/api/status`);
    console.log(`⚡ Performance otimizada ativada`);
    
    if (isProduction) {
      console.log(`🏭 Modo produção com ${numCPUs} workers`);
    }
  });

  // Graceful shutdown
  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);

  function gracefulShutdown(signal) {
    console.log(`🛑 Recebido ${signal}, encerrando servidor graciosamente...`);
    
    server.close(() => {
      console.log('✅ Servidor HTTP encerrado');
      
      mongoose.connection.close(false, () => {
        console.log('✅ Conexão MongoDB encerrada');
        process.exit(0);
      });
    });

    // Forçar encerramento após 10 segundos
    setTimeout(() => {
      console.error('⚠️  Forçando encerramento...');
      process.exit(1);
    }, 10000);
  }
}

export default startServer;
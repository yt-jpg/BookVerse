import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fs from 'fs';

// Importar middlewares de segurança
import {
  helmetConfig,
  apiLimiter,
  authLimiter,
  uploadLimiter,
  strictLimiter,
  attackDetection,
  ddosProtection,
  sanitizeData,
  performanceMonitor,
  logSecurityEvent
} from './middleware/security.js';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const server = createServer(app);

// Configurar Socket.IO com segurança
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  // Configurações de segurança para WebSocket
  allowEIO3: false,
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

const PORT = process.env.PORT || 5000;

// Middleware de segurança básica (aplicar primeiro)
app.use(helmetConfig);
app.use(ddosProtection);
app.use(attackDetection);
app.use(performanceMonitor);

// Trust proxy para IPs corretos (importante para rate limiting)
app.set('trust proxy', 1);

// Middleware de parsing com limites de segurança
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Verificar se JSON é válido
    try {
      JSON.parse(buf);
    } catch (e) {
      logSecurityEvent('INVALID_JSON', req);
      throw new Error('JSON inválido');
    }
  }
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
  parameterLimit: 100 // Limitar número de parâmetros
}));

// Sanitização de dados
app.use(sanitizeData);

// CORS configurado com segurança
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:5000'
    ].filter(Boolean);

    // Permitir requisições sem origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logSecurityEvent('CORS_VIOLATION', null, { origin });
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // Cache preflight por 24h
};

app.use(cors(corsOptions));

// Rate limiting por rota
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);
app.use('/api/upload/', uploadLimiter);
app.use('/api/admin/', strictLimiter);

// Conectar ao MongoDB com configurações de segurança
const connectDB = async () => {
  try {
    const mongoOptions = {
      // Configurações de segurança
      authSource: 'admin',
      ssl: process.env.NODE_ENV === 'production',
      sslValidate: process.env.NODE_ENV === 'production',
      
      // Configurações de performance e segurança
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      
      // Configurações de retry
      retryWrites: true,
      retryReads: true
    };

    await mongoose.connect(process.env.MONGODB_URI, mongoOptions);
    console.log('✅ MongoDB conectado com segurança');
    logSecurityEvent('DATABASE_CONNECTED', null);
  } catch (error) {
    console.error('❌ Erro ao conectar MongoDB:', error.message);
    logSecurityEvent('DATABASE_ERROR', null, { error: error.message });
    
    // Não encerrar processo em produção, tentar reconectar
    if (process.env.NODE_ENV === 'production') {
      console.log('🔄 Tentando reconectar em 5 segundos...');
      setTimeout(connectDB, 5000);
    } else {
      process.exit(1);
    }
  }
};

// Middleware de logging de requisições
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };
    
    // Log apenas requisições importantes ou com erro
    if (res.statusCode >= 400 || duration > 1000) {
      console.log('📊 REQUEST:', logData);
    }
  });
  
  next();
});

// Servir arquivos estáticos com segurança
const buildPath = path.join(__dirname, '..', 'client', 'build');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath, {
    // Configurações de segurança para arquivos estáticos
    dotfiles: 'deny',
    etag: true,
    extensions: ['html', 'js', 'css', 'png', 'jpg', 'jpeg', 'gif', 'ico', 'svg'],
    index: 'index.html',
    maxAge: '1d',
    redirect: false,
    setHeaders: (res, path) => {
      // Headers de segurança para arquivos estáticos
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      
      // Cache control baseado no tipo de arquivo
      if (path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      } else if (path.match(/\.(js|css)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000');
      }
    }
  }));
}

// Servir uploads com verificação de segurança
app.use('/uploads', (req, res, next) => {
  // Verificar se arquivo existe e é seguro
  const filePath = path.join(__dirname, '..', 'uploads', req.path);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Arquivo não encontrado' });
  }
  
  // Verificar se não é um arquivo executável
  const ext = path.extname(filePath).toLowerCase();
  const dangerousExts = ['.exe', '.bat', '.cmd', '.com', '.scr', '.pif', '.js', '.vbs'];
  
  if (dangerousExts.includes(ext)) {
    logSecurityEvent('DANGEROUS_FILE_ACCESS', req, { file: req.path });
    return res.status(403).json({ error: 'Tipo de arquivo não permitido' });
  }
  
  next();
}, express.static(path.join(__dirname, '..', 'uploads')));

// Rota de status com informações de segurança
app.get('/api/status', (req, res) => {
  const status = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    security: {
      helmet: true,
      rateLimit: true,
      ddosProtection: true,
      inputValidation: true,
      cors: true
    }
  };
  
  // Não expor informações sensíveis em produção
  if (process.env.NODE_ENV === 'production') {
    delete status.memory;
    delete status.uptime;
  }
  
  res.json(status);
});

// Importar e usar rotas com tratamento de erro
try {
  const authRoutes = await import('./routes/auth.js');
  const bookRoutes = await import('./routes/books.js');
  const adminRoutes = await import('./routes/admin.js');
  const notificationRoutes = await import('./routes/notifications.js');

  app.use('/api/auth', authRoutes.default);
  app.use('/api/books', bookRoutes.default);
  app.use('/api/admin', adminRoutes.default);
  app.use('/api/notifications', notificationRoutes.default);
  
  console.log('✅ Rotas carregadas com segurança');
} catch (error) {
  console.error('❌ Erro ao carregar rotas:', error.message);
  logSecurityEvent('ROUTES_ERROR', null, { error: error.message });
}

// Middleware de tratamento de erros de segurança
app.use((error, req, res, next) => {
  // Log do erro
  logSecurityEvent('APPLICATION_ERROR', req, { 
    error: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });

  // Não expor detalhes do erro em produção
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(500).json({
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  // Log de tentativa de acesso a rota inexistente
  logSecurityEvent('ROUTE_NOT_FOUND', req);
  
  // Se for uma requisição de API, retornar JSON
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({ 
      error: 'Endpoint não encontrado',
      timestamp: new Date().toISOString()
    });
  }
  
  // Para outras requisições, servir o React app
  const indexPath = path.join(__dirname, '..', 'client', 'build', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Aplicação não encontrada');
  }
});

// Configurar WebSocket com segurança
io.use((socket, next) => {
  // Verificar origem
  const origin = socket.handshake.headers.origin;
  const allowedOrigins = [process.env.FRONTEND_URL, 'http://localhost:3000'];
  
  if (!allowedOrigins.includes(origin)) {
    logSecurityEvent('WEBSOCKET_ORIGIN_DENIED', null, { origin });
    return next(new Error('Origem não permitida'));
  }
  
  // Rate limiting para WebSocket
  const ip = socket.handshake.address;
  // Implementar rate limiting aqui se necessário
  
  next();
});

io.on('connection', (socket) => {
  logSecurityEvent('WEBSOCKET_CONNECTION', null, { 
    socketId: socket.id,
    ip: socket.handshake.address 
  });
  
  socket.on('disconnect', () => {
    logSecurityEvent('WEBSOCKET_DISCONNECT', null, { socketId: socket.id });
  });
});

// Conectar ao banco e iniciar servidor
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 BookVerse Server Seguro rodando na porta ${PORT}`);
    console.log(`🔒 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🛡️  Segurança: Ativada`);
    console.log(`📊 Status: http://localhost:${PORT}/api/status`);
    
    logSecurityEvent('SERVER_STARTED', null, { port: PORT });
  });
});

// Graceful shutdown com limpeza de segurança
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 Recebido ${signal}, encerrando servidor com segurança...`);
  
  logSecurityEvent('SERVER_SHUTDOWN', null, { signal });
  
  server.close(() => {
    console.log('✅ Servidor HTTP encerrado');
    
    mongoose.connection.close(() => {
      console.log('✅ Conexão MongoDB encerrada');
      process.exit(0);
    });
  });
  
  // Forçar encerramento após 10 segundos
  setTimeout(() => {
    console.log('⚠️  Forçando encerramento...');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Capturar erros não tratados
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não capturado:', error);
  logSecurityEvent('UNCAUGHT_EXCEPTION', null, { error: error.message });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada:', reason);
  logSecurityEvent('UNHANDLED_REJECTION', null, { reason: reason.toString() });
});

export default app;
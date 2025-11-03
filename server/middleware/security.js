import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Lista de IPs bloqueados
const blockedIPs = new Set();
const suspiciousIPs = new Map(); // IP -> { attempts, lastAttempt, blocked }

// Lista de User-Agents suspeitos
const suspiciousUserAgents = [
  'sqlmap', 'nikto', 'nmap', 'masscan', 'zap', 'burp', 'acunetix',
  'nessus', 'openvas', 'w3af', 'skipfish', 'wpscan', 'dirb', 'gobuster'
];

// Padrões de ataques comuns
const attackPatterns = [
  /(\<|\%3C).*script.*(\>|\%3E)/i, // XSS
  /(union|select|insert|delete|update|drop|create|alter|exec|execute)/i, // SQL Injection
  /(\.\.|\.\/|\.\\)/g, // Path Traversal
  /(eval|system|exec|shell_exec|passthru|file_get_contents)/i, // Code Injection
  /(<iframe|<object|<embed|<script|javascript:|vbscript:|onload=|onerror=)/i // HTML Injection
];

// Rate Limiting Avançado
export const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100, message = 'Muitas tentativas') => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: message,
      retryAfter: Math.ceil(windowMs / 1000),
      timestamp: new Date().toISOString()
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', req);
      res.status(429).json({
        error: message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Rate limiters específicos
export const authLimiter = createRateLimiter(15 * 60 * 1000, 5, 'Muitas tentativas de login');
export const apiLimiter = createRateLimiter(15 * 60 * 1000, 1000, 'Limite de API excedido');
export const uploadLimiter = createRateLimiter(60 * 60 * 1000, 10, 'Muitos uploads');
export const strictLimiter = createRateLimiter(5 * 60 * 1000, 10, 'Acesso muito frequente');

// Configuração do Helmet para segurança
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  frameguard: { action: 'deny' },
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
});

// Middleware de detecção de ataques
export const attackDetection = (req, res, next) => {
  const ip = getClientIP(req);
  const userAgent = req.get('User-Agent') || '';
  const url = req.url;
  const body = JSON.stringify(req.body);
  
  // Verificar IP bloqueado
  if (blockedIPs.has(ip)) {
    logSecurityEvent('BLOCKED_IP_ACCESS', req);
    return res.status(403).json({ error: 'Acesso negado' });
  }

  // Verificar User-Agent suspeito
  if (suspiciousUserAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
    blockIP(ip, 'SUSPICIOUS_USER_AGENT');
    logSecurityEvent('SUSPICIOUS_USER_AGENT', req);
    return res.status(403).json({ error: 'Acesso negado' });
  }

  // Verificar padrões de ataque
  const testString = url + ' ' + body;
  for (const pattern of attackPatterns) {
    if (pattern.test(testString)) {
      incrementSuspiciousActivity(ip);
      logSecurityEvent('ATTACK_PATTERN_DETECTED', req, { pattern: pattern.toString() });
      return res.status(400).json({ error: 'Requisição inválida' });
    }
  }

  // Verificar tamanho da requisição
  if (req.get('content-length') > 10 * 1024 * 1024) { // 10MB
    logSecurityEvent('LARGE_REQUEST', req);
    return res.status(413).json({ error: 'Requisição muito grande' });
  }

  next();
};

// Middleware anti-DDoS
export const ddosProtection = (req, res, next) => {
  const ip = getClientIP(req);
  
  if (!suspiciousIPs.has(ip)) {
    suspiciousIPs.set(ip, { attempts: 0, lastAttempt: Date.now(), blocked: false });
  }

  const ipData = suspiciousIPs.get(ip);
  const now = Date.now();
  
  // Reset contador se passou mais de 1 hora
  if (now - ipData.lastAttempt > 60 * 60 * 1000) {
    ipData.attempts = 0;
  }

  ipData.attempts++;
  ipData.lastAttempt = now;

  // Bloquear se muitas tentativas
  if (ipData.attempts > 1000) { // 1000 requests por hora
    blockIP(ip, 'DDOS_PROTECTION');
    logSecurityEvent('DDOS_DETECTED', req);
    return res.status(429).json({ error: 'Muitas requisições' });
  }

  next();
};

// Validadores de entrada
export const validateInput = {
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email inválido'),
    
  password: body('password')
    .isLength({ min: 8, max: 128 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e símbolo'),
    
  name: body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Nome deve conter apenas letras e espaços'),
    
  bookTitle: body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .escape()
    .withMessage('Título inválido'),
    
  bookAuthor: body('author')
    .trim()
    .isLength({ min: 1, max: 100 })
    .escape()
    .withMessage('Autor inválido')
};

// Middleware de validação
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logSecurityEvent('VALIDATION_ERROR', req, { errors: errors.array() });
    return res.status(400).json({
      error: 'Dados inválidos',
      details: errors.array()
    });
  }
  next();
};

// Sanitização de dados
export const sanitizeData = (req, res, next) => {
  // Sanitizar MongoDB
  mongoSanitize()(req, res, () => {
    // Sanitizar parâmetros HTTP
    hpp()(req, res, () => {
      // Sanitização customizada
      if (req.body) {
        req.body = sanitizeObject(req.body);
      }
      if (req.query) {
        req.query = sanitizeObject(req.query);
      }
      next();
    });
  });
};

// Função para sanitizar objetos
const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      // Remover caracteres perigosos
      sanitized[key] = value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

// Middleware de segurança para uploads
export const secureUpload = (req, res, next) => {
  if (!req.file) return next();

  const file = req.file;
  const allowedTypes = ['application/pdf', 'application/epub+zip', 'text/plain'];
  const maxSize = 50 * 1024 * 1024; // 50MB

  // Verificar tipo de arquivo
  if (!allowedTypes.includes(file.mimetype)) {
    logSecurityEvent('INVALID_FILE_TYPE', req, { mimetype: file.mimetype });
    return res.status(400).json({ error: 'Tipo de arquivo não permitido' });
  }

  // Verificar tamanho
  if (file.size > maxSize) {
    logSecurityEvent('FILE_TOO_LARGE', req, { size: file.size });
    return res.status(400).json({ error: 'Arquivo muito grande' });
  }

  // Verificar nome do arquivo
  if (!/^[a-zA-Z0-9._-]+$/.test(file.originalname)) {
    logSecurityEvent('INVALID_FILENAME', req, { filename: file.originalname });
    return res.status(400).json({ error: 'Nome de arquivo inválido' });
  }

  next();
};

// Middleware de autenticação segura
export const secureAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  try {
    // Verificar se token não está na blacklist
    if (isTokenBlacklisted(token)) {
      logSecurityEvent('BLACKLISTED_TOKEN', req);
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Verificar integridade do token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    // Log de acesso
    logSecurityEvent('AUTH_SUCCESS', req, { userId: decoded.id });
    next();
  } catch (error) {
    logSecurityEvent('AUTH_FAILURE', req, { error: error.message });
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Funções auxiliares
const getClientIP = (req) => {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.headers['x-forwarded-for']?.split(',')[0] ||
         req.headers['x-real-ip'] ||
         '0.0.0.0';
};

const blockIP = (ip, reason) => {
  blockedIPs.add(ip);
  logSecurityEvent('IP_BLOCKED', null, { ip, reason });
  
  // Remover bloqueio após 24 horas
  setTimeout(() => {
    blockedIPs.delete(ip);
    logSecurityEvent('IP_UNBLOCKED', null, { ip });
  }, 24 * 60 * 60 * 1000);
};

const incrementSuspiciousActivity = (ip) => {
  if (!suspiciousIPs.has(ip)) {
    suspiciousIPs.set(ip, { attempts: 0, lastAttempt: Date.now(), blocked: false });
  }
  
  const ipData = suspiciousIPs.get(ip);
  ipData.attempts += 10; // Penalidade maior para atividade suspeita
  
  if (ipData.attempts > 50) {
    blockIP(ip, 'SUSPICIOUS_ACTIVITY');
  }
};

// Sistema de logging de segurança
const logSecurityEvent = (event, req, extra = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    ip: req ? getClientIP(req) : 'system',
    userAgent: req ? req.get('User-Agent') : 'system',
    url: req ? req.url : null,
    method: req ? req.method : null,
    ...extra
  };

  // Log no console
  console.log(`🔒 SECURITY: ${event}`, logEntry);

  // Salvar em arquivo
  const logDir = 'logs';
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logFile = path.join(logDir, `security-${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');

  // Alertas críticos
  const criticalEvents = ['DDOS_DETECTED', 'ATTACK_PATTERN_DETECTED', 'SUSPICIOUS_USER_AGENT'];
  if (criticalEvents.includes(event)) {
    sendSecurityAlert(logEntry);
  }
};

// Sistema de alertas
const sendSecurityAlert = (logEntry) => {
  // Aqui você pode implementar notificações por email, Slack, etc.
  console.log('🚨 ALERTA DE SEGURANÇA:', logEntry);
};

// Blacklist de tokens
const tokenBlacklist = new Set();

export const blacklistToken = (token) => {
  tokenBlacklist.add(token);
  
  // Remover da blacklist após expiração (24h)
  setTimeout(() => {
    tokenBlacklist.delete(token);
  }, 24 * 60 * 60 * 1000);
};

const isTokenBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};

// Middleware de monitoramento de performance
export const performanceMonitor = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log requisições lentas
    if (duration > 5000) { // 5 segundos
      logSecurityEvent('SLOW_REQUEST', req, { duration });
    }
    
    // Log requisições com erro
    if (res.statusCode >= 400) {
      logSecurityEvent('ERROR_RESPONSE', req, { 
        statusCode: res.statusCode,
        duration 
      });
    }
  });
  
  next();
};

export default {
  createRateLimiter,
  authLimiter,
  apiLimiter,
  uploadLimiter,
  strictLimiter,
  helmetConfig,
  attackDetection,
  ddosProtection,
  validateInput,
  handleValidationErrors,
  sanitizeData,
  secureUpload,
  secureAuth,
  performanceMonitor,
  blacklistToken,
  logSecurityEvent
};
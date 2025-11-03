import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';

// Cache em memória para dados frequentes
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Middleware de cache inteligente
export const smartCache = (duration = 300) => {
  return (req, res, next) => {
    // Apenas GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl;
    const cached = cache.get(key);

    if (cached && (Date.now() - cached.timestamp) < duration * 1000) {
      res.set('X-Cache', 'HIT');
      return res.json(cached.data);
    }

    // Interceptar res.json para cachear
    const originalJson = res.json;
    res.json = function(data) {
      cache.set(key, {
        data: data,
        timestamp: Date.now()
      });
      res.set('X-Cache', 'MISS');
      return originalJson.call(this, data);
    };

    next();
  };
};

// Limpeza automática do cache
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      cache.delete(key);
    }
  }
}, 60000); // Limpar a cada minuto

// Middleware de compressão otimizada
export const optimizedCompression = compression({
  level: 6, // Balanceio entre compressão e CPU
  threshold: 1024, // Comprimir apenas arquivos > 1KB
  filter: (req, res) => {
    // Não comprimir se já comprimido
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
});

// Headers de performance
export const performanceHeaders = (req, res, next) => {
  // Cache para recursos estáticos
  if (req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    res.set('Cache-Control', 'public, max-age=31536000'); // 1 ano
    res.set('Expires', new Date(Date.now() + 31536000000).toUTCString());
  }

  // Cache para API responses
  if (req.url.startsWith('/api/')) {
    res.set('Cache-Control', 'public, max-age=300'); // 5 minutos
  }

  // Preload hints para recursos críticos
  res.set('Link', [
    '</static/css/main.css>; rel=preload; as=style',
    '</static/js/main.js>; rel=preload; as=script',
    '</api/auth/me>; rel=prefetch'
  ].join(', '));

  // Performance headers
  res.set('X-DNS-Prefetch-Control', 'on');
  res.set('X-Frame-Options', 'SAMEORIGIN');
  res.set('X-Content-Type-Options', 'nosniff');

  next();
};

// Rate limiting inteligente
export const adaptiveRateLimit = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minuto
  const maxRequests = 100; // Requests por minuto

  if (!cache.has(`rate_${ip}`)) {
    cache.set(`rate_${ip}`, { count: 1, resetTime: now + windowMs });
    return next();
  }

  const rateData = cache.get(`rate_${ip}`);
  
  if (now > rateData.resetTime) {
    rateData.count = 1;
    rateData.resetTime = now + windowMs;
  } else {
    rateData.count++;
  }

  if (rateData.count > maxRequests) {
    return res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil((rateData.resetTime - now) / 1000)
    });
  }

  res.set('X-RateLimit-Limit', maxRequests);
  res.set('X-RateLimit-Remaining', Math.max(0, maxRequests - rateData.count));
  res.set('X-RateLimit-Reset', new Date(rateData.resetTime).toISOString());

  next();
};

// Middleware de otimização de imagens
export const imageOptimization = (req, res, next) => {
  if (req.url.match(/\.(jpg|jpeg|png|gif)$/)) {
    // Headers para otimização de imagens
    res.set('Vary', 'Accept');
    
    // Suporte a WebP se o browser suportar
    if (req.headers.accept && req.headers.accept.includes('image/webp')) {
      res.set('Content-Type', 'image/webp');
    }
  }
  next();
};

export default {
  smartCache,
  optimizedCompression,
  performanceHeaders,
  adaptiveRateLimit,
  imageOptimization
};
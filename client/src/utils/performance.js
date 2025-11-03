// Utilitários de performance para o frontend

// Lazy loading de componentes
export const lazyLoad = (importFunc, fallback = null) => {
  const LazyComponent = React.lazy(importFunc);
  
  return (props) => (
    <React.Suspense fallback={fallback || <div>Carregando...</div>}>
      <LazyComponent {...props} />
    </React.Suspense>
  );
};

// Debounce para inputs de busca
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle para scroll events
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Cache para requisições
class APICache {
  constructor(maxSize = 100, ttl = 5 * 60 * 1000) { // 5 minutos
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  set(key, data) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear() {
    this.cache.clear();
  }
}

export const apiCache = new APICache();

// Interceptor para axios com cache
export const setupAxiosCache = (axios) => {
  axios.interceptors.request.use((config) => {
    if (config.method === 'get') {
      const cached = apiCache.get(config.url);
      if (cached) {
        config.adapter = () => Promise.resolve({
          data: cached,
          status: 200,
          statusText: 'OK',
          headers: { 'x-cache': 'HIT' },
          config
        });
      }
    }
    return config;
  });

  axios.interceptors.response.use((response) => {
    if (response.config.method === 'get' && response.status === 200) {
      apiCache.set(response.config.url, response.data);
    }
    return response;
  });
};

// Preload de recursos críticos
export const preloadResource = (href, as = 'script') => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
};

// Prefetch de rotas
export const prefetchRoute = (route) => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = route;
  document.head.appendChild(link);
};

// Otimização de imagens
export const optimizeImage = (src, options = {}) => {
  const {
    width = 'auto',
    height = 'auto',
    quality = 80,
    format = 'webp'
  } = options;

  // Se o browser suporta WebP, usar WebP
  const supportsWebP = () => {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  };

  if (supportsWebP() && !src.includes('.svg')) {
    return `${src}?format=${format}&quality=${quality}&w=${width}&h=${height}`;
  }

  return src;
};

// Intersection Observer para lazy loading
export const createLazyLoader = (callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
  };

  return new IntersectionObserver(callback, { ...defaultOptions, ...options });
};

// Performance monitoring
export const performanceMonitor = {
  mark: (name) => {
    if (performance.mark) {
      performance.mark(name);
    }
  },

  measure: (name, startMark, endMark) => {
    if (performance.measure) {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];
      console.log(`⚡ ${name}: ${measure.duration.toFixed(2)}ms`);
      return measure.duration;
    }
  },

  getMetrics: () => {
    if (!performance.getEntriesByType) return {};

    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');

    return {
      // Métricas de carregamento
      domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
      loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,
      
      // Métricas de renderização
      firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
      
      // Métricas de rede
      dnsLookup: navigation?.domainLookupEnd - navigation?.domainLookupStart,
      tcpConnect: navigation?.connectEnd - navigation?.connectStart,
      serverResponse: navigation?.responseEnd - navigation?.requestStart
    };
  }
};

// Hook personalizado para performance
export const usePerformance = () => {
  const [metrics, setMetrics] = React.useState({});

  React.useEffect(() => {
    const updateMetrics = () => {
      setMetrics(performanceMonitor.getMetrics());
    };

    // Atualizar métricas quando a página carregar
    if (document.readyState === 'complete') {
      updateMetrics();
    } else {
      window.addEventListener('load', updateMetrics);
    }

    return () => window.removeEventListener('load', updateMetrics);
  }, []);

  return metrics;
};

// Service Worker para cache
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('✅ SW registrado:', registration.scope);
        })
        .catch((error) => {
          console.log('❌ SW falhou:', error);
        });
    });
  }
};

export default {
  lazyLoad,
  debounce,
  throttle,
  apiCache,
  setupAxiosCache,
  preloadResource,
  prefetchRoute,
  optimizeImage,
  createLazyLoader,
  performanceMonitor,
  usePerformance,
  registerServiceWorker
};
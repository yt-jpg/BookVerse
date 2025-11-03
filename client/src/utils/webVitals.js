import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

// Função para enviar métricas para analytics
const sendToAnalytics = (metric) => {
  // Em produção, envie para seu serviço de analytics
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Web Vital:', metric);
  }
  
  // Exemplo de envio para Google Analytics
  if (window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
    });
  }
  
  // Envio para servidor próprio
  if (process.env.REACT_APP_ANALYTICS_ENDPOINT) {
    fetch(process.env.REACT_APP_ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metric: metric.name,
        value: metric.value,
        id: metric.id,
        timestamp: Date.now(),
        url: window.location.href
      })
    }).catch(console.error);
  }
};

// Configuração de thresholds para alertas
const THRESHOLDS = {
  CLS: 0.1,    // Cumulative Layout Shift
  FID: 100,    // First Input Delay
  FCP: 1800,   // First Contentful Paint
  LCP: 2500,   // Largest Contentful Paint
  TTFB: 800    // Time to First Byte
};

// Função para verificar se métrica está dentro do threshold
const checkThreshold = (metric) => {
  const threshold = THRESHOLDS[metric.name];
  if (threshold && metric.value > threshold) {
    console.warn(`⚠️ ${metric.name} acima do threshold: ${metric.value} > ${threshold}`);
    
    // Sugestões de otimização baseadas na métrica
    const suggestions = getOptimizationSuggestions(metric.name);
    console.log('💡 Sugestões:', suggestions);
  }
};

// Sugestões de otimização por métrica
const getOptimizationSuggestions = (metricName) => {
  const suggestions = {
    CLS: [
      'Defina dimensões para imagens e vídeos',
      'Reserve espaço para anúncios e embeds',
      'Evite inserir conteúdo acima do fold'
    ],
    FID: [
      'Reduza JavaScript não utilizado',
      'Implemente code splitting',
      'Use web workers para tarefas pesadas'
    ],
    FCP: [
      'Otimize recursos críticos',
      'Elimine recursos que bloqueiam renderização',
      'Use preload para recursos importantes'
    ],
    LCP: [
      'Otimize imagens (WebP, lazy loading)',
      'Use CDN para recursos estáticos',
      'Implemente server-side rendering'
    ],
    TTFB: [
      'Otimize servidor e banco de dados',
      'Use cache no servidor',
      'Considere CDN para conteúdo dinâmico'
    ]
  };
  
  return suggestions[metricName] || [];
};

// Função principal para inicializar monitoramento
export const initWebVitals = () => {
  const handleMetric = (metric) => {
    sendToAnalytics(metric);
    checkThreshold(metric);
  };

  // Coleta todas as métricas Web Vitals
  getCLS(handleMetric);
  getFID(handleMetric);
  getFCP(handleMetric);
  getLCP(handleMetric);
  getTTFB(handleMetric);
};

// Função para monitoramento customizado
export const trackCustomMetric = (name, value, unit = 'ms') => {
  const metric = {
    name: `custom_${name}`,
    value,
    unit,
    timestamp: Date.now(),
    id: `${name}_${Date.now()}`
  };
  
  sendToAnalytics(metric);
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`📈 Custom Metric - ${name}: ${value}${unit}`);
  }
};

// Hook para React
export const useWebVitals = () => {
  const trackPageView = (pageName) => {
    trackCustomMetric('page_view', 1, 'count');
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`👁️ Page View: ${pageName}`);
    }
  };
  
  const trackUserAction = (action, value = 1) => {
    trackCustomMetric(`user_${action}`, value, 'count');
  };
  
  const trackLoadTime = (componentName, startTime) => {
    const loadTime = performance.now() - startTime;
    trackCustomMetric(`component_load_${componentName}`, loadTime);
  };
  
  return {
    trackPageView,
    trackUserAction,
    trackLoadTime
  };
};

// Monitoramento de performance de componentes React
export const withPerformanceTracking = (WrappedComponent, componentName) => {
  return function PerformanceTrackedComponent(props) {
    const startTime = performance.now();
    
    // Usar React apenas se disponível
    if (typeof window !== 'undefined' && window.React) {
      window.React.useEffect(() => {
        const loadTime = performance.now() - startTime;
        trackCustomMetric(`component_mount_${componentName}`, loadTime);
      }, []);
      
      return window.React.createElement(WrappedComponent, props);
    }
    
    // Fallback sem React
    return null;
  };
};
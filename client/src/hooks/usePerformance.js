import { useEffect, useCallback, useRef } from 'react';

// Hook para monitoramento de performance
export const usePerformance = () => {
  const metricsRef = useRef({});

  const measurePerformance = useCallback((name, fn) => {
    return async (...args) => {
      const start = performance.now();
      const result = await fn(...args);
      const end = performance.now();
      
      metricsRef.current[name] = {
        duration: end - start,
        timestamp: Date.now()
      };
      
      // Log apenas em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.log(`⚡ ${name}: ${(end - start).toFixed(2)}ms`);
      }
      
      return result;
    };
  }, []);

  const getMetrics = useCallback(() => {
    return { ...metricsRef.current };
  }, []);

  return { measurePerformance, getMetrics };
};

// Hook para lazy loading de imagens
export const useLazyImage = (src, options = {}) => {
  const imgRef = useRef();
  const { threshold = 0.1, rootMargin = '50px' } = options;

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          img.src = src;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(img);

    return () => observer.disconnect();
  }, [src, threshold, rootMargin]);

  return imgRef;
};

// Hook para debounce otimizado
export const useDebounce = (callback, delay) => {
  const timeoutRef = useRef();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]);
};

// Hook para virtual scrolling
export const useVirtualScroll = (items, itemHeight, containerHeight) => {
  const scrollTop = useRef(0);
  const visibleStart = Math.floor(scrollTop.current / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  const visibleItems = items.slice(visibleStart, visibleEnd).map((item, index) => ({
    ...item,
    index: visibleStart + index
  }));

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;

  const handleScroll = useCallback((e) => {
    scrollTop.current = e.target.scrollTop;
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll
  };
};
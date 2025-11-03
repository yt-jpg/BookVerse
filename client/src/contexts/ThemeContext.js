import { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  return useContext(ThemeContext);
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true; // Dark mode como padrão
  });

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    
    // Atualizar favicon baseado no tema
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) {
      const faviconSvg = isDarkMode 
        ? `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%239370db'/%3E%3Crect x='8' y='8' width='16' height='16' rx='1' fill='white'/%3E%3Crect x='8' y='8' width='2' height='16' fill='%23ccc'/%3E%3Crect x='11' y='11' width='8' height='1' fill='%239370db'/%3E%3Crect x='11' y='13' width='6' height='1' fill='%236a5acd'/%3E%3Crect x='11' y='15' width='7' height='1' fill='%239370db'/%3E%3Crect x='20' y='8' width='2' height='6' fill='%2300ff88'/%3E%3C/svg%3E`
        : `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%23667eea'/%3E%3Crect x='8' y='8' width='16' height='16' rx='1' fill='white'/%3E%3Crect x='8' y='8' width='2' height='16' fill='%23ccc'/%3E%3Crect x='11' y='11' width='8' height='1' fill='%23667eea'/%3E%3Crect x='11' y='13' width='6' height='1' fill='%23764ba2'/%3E%3Crect x='11' y='15' width='7' height='1' fill='%23667eea'/%3E%3Crect x='20' y='8' width='2' height='6' fill='%2300ff88'/%3E%3C/svg%3E`;
      favicon.href = faviconSvg;
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    // Criar efeito de flash na transição
    const flashOverlay = document.createElement('div');
    flashOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: radial-gradient(circle, rgba(0,255,136,0.3) 0%, rgba(0,255,136,0.1) 50%, transparent 100%);
      z-index: 9999;
      pointer-events: none;
      animation: themeFlash 0.6s ease-out forwards;
    `;
    
    // Adicionar keyframes se não existirem
    if (!document.querySelector('#theme-flash-styles')) {
      const style = document.createElement('style');
      style.id = 'theme-flash-styles';
      style.textContent = `
        @keyframes themeFlash {
          0% { opacity: 0; transform: scale(0.8); }
          30% { opacity: 1; transform: scale(1.1); }
          100% { opacity: 0; transform: scale(1.2); }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(flashOverlay);
    
    // Remover o overlay após a animação
    setTimeout(() => {
      if (flashOverlay.parentNode) {
        flashOverlay.parentNode.removeChild(flashOverlay);
      }
    }, 600);
    
    setIsDarkMode(!isDarkMode);
  };

  const value = {
    isDarkMode,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
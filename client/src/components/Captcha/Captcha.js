import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import './Captcha.css';

const Captcha = ({ onVerify, isValid, setIsValid }) => {
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const canvasRef = useRef(null);
  const { t } = useLanguage();

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const drawCaptcha = (text) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Ajustar tamanho baseado na largura da tela
    const isMobile = window.innerWidth <= 480;
    const isTablet = window.innerWidth <= 768;
    
    if (isMobile) {
      canvas.width = 110;
      canvas.height = 40;
    } else if (isTablet) {
      canvas.width = 120;
      canvas.height = 45;
    } else {
      canvas.width = 140;
      canvas.height = 50;
    }
    
    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background com gradiente
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#f8f9fa');
    gradient.addColorStop(1, '#e9ecef');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Adicionar ruído de fundo
    for (let i = 0; i < 100; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.1)`;
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
    }
    
    // Desenhar linhas de interferência
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3)`;
      ctx.lineWidth = Math.random() * 2 + 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }
    
    // Desenhar texto do captcha
    
    let fontSize, spacing, yCenter;
    if (isMobile) {
      fontSize = 14;
      spacing = 14;
      yCenter = 20;
    } else if (isTablet) {
      fontSize = 15;
      spacing = 15;
      yCenter = 22;
    } else {
      fontSize = 16;
      spacing = 17;
      yCenter = 25;
    }
    
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const colors = ['#667eea', '#764ba2', '#4169E1', '#6A5ACD', '#9370DB'];
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const x = 15 + (i * spacing) + Math.random() * 4 - 2;
      const y = yCenter + Math.random() * 4 - 2;
      const rotation = (Math.random() - 0.5) * 0.2;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
  };

  const refreshCaptcha = () => {
    const newCaptcha = generateCaptcha();
    setCaptchaText(newCaptcha);
    setUserInput('');
    setIsValid(false);
    setTimeout(() => drawCaptcha(newCaptcha), 100);
  };

  useEffect(() => {
    refreshCaptcha();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const isCorrect = userInput.toLowerCase() === captchaText.toLowerCase() && userInput.length > 0;
    setIsValid(isCorrect);
    if (onVerify) {
      onVerify(isCorrect);
    }
    
    // Mostrar popup de erro apenas quando o usuário digitou algo e está errado
    if (userInput.length > 0 && !isCorrect && userInput.length >= captchaText.length) {
      setShowErrorPopup(true);
      setTimeout(() => setShowErrorPopup(false), 3000);
    }
  }, [userInput, captchaText, onVerify, setIsValid]);

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
    setShowErrorPopup(false); // Esconder popup quando usuário digita
  };

  return (
    <div className="captcha-container">
      <label className="captcha-label">{t('securityVerification')}</label>
      
      <div className="captcha-display">
        <canvas 
          ref={canvasRef} 
          className="captcha-canvas"
          aria-label="Imagem do captcha"
        />
        <button 
          type="button" 
          onClick={refreshCaptcha}
          className="captcha-refresh"
          aria-label="Gerar novo captcha"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23,4 23,10 17,10"></polyline>
            <polyline points="1,20 1,14 7,14"></polyline>
            <path d="M20.49,9A9,9,0,0,0,5.64,5.64L1,10m22,4L18.36,18.36A9,9,0,0,1,3.51,15"></path>
          </svg>
        </button>
      </div>
      
      <input
        type="text"
        value={userInput}
        onChange={handleInputChange}
        placeholder={t('enterCodeAbove')}
        className={`captcha-input ${isValid ? 'valid' : userInput ? 'invalid' : ''}`}
        maxLength="6"
        autoComplete="off"
      />
      
      {/* Pop-up de erro elegante */}
      {showErrorPopup && (
        <div className="captcha-error-popup">
          <div className="popup-content">
            <div className="popup-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <div className="popup-text">
              <h4>{t('incorrectCode')}</h4>
              <p>{t('checkCodeTryAgain')}</p>
            </div>
            <button 
              className="popup-close"
              onClick={() => setShowErrorPopup(false)}
              aria-label="Fechar"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Captcha;
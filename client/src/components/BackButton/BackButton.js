import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import './BackButton.css';

const BackButton = ({ to = '/login', className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  // Não mostrar o botão se estiver na página de login
  if (location.pathname === '/login' || location.pathname === '/') {
    return null;
  }

  const handleBack = () => {
    navigate(to);
  };

  return (
    <button 
      onClick={handleBack}
      className={`back-button ${className}`}
      aria-label={t('goBack')}
    >
      <svg 
        className="back-icon" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
      >
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
      <span>{t('goBack')}</span>
    </button>
  );
};

export default BackButton;
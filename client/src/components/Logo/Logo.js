
import { useLanguage } from '../../contexts/LanguageContext';
import './Logo.css';

const Logo = ({ size = 'medium', showText = true }) => {
  const { t } = useLanguage();
  
  return (
    <div className={`logo-container ${size}`}>
      <div className="logo-icon">
        <div className="book-spine"></div>
        <div className="book-pages">
          <div className="page page-1"></div>
          <div className="page page-2"></div>
          <div className="page page-3"></div>
        </div>
        <div className="book-cover">
          <div className="book-title">📚</div>
        </div>
        <div className="sparkle sparkle-1">✨</div>
        <div className="sparkle sparkle-2">⭐</div>
        <div className="sparkle sparkle-3">💫</div>
      </div>
      {showText && (
        <div className="logo-text">
          <h1>{t('appName')}</h1>
          <p>{t('appSubtitle')}</p>
        </div>
      )}
    </div>
  );
};

export default Logo;
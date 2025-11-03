import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import './LanguageSelector.css';

const LanguageSelector = () => {
  const { getCurrentLanguage, getAvailableLanguages, changeLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = getCurrentLanguage();
  const availableLanguages = getAvailableLanguages();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageSelect = (languageCode) => {
    changeLanguage(languageCode);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="language-selector-wrapper" ref={dropdownRef}>
      <button 
        className="language-selector-btn" 
        onClick={toggleDropdown}
        onMouseEnter={() => setIsOpen(true)}
        aria-label={t('language')}
      >
        <div className="language-content">
          <img src={currentLang.flag} alt={currentLang.name} className="language-flag" />
          <span className="language-name">{currentLang.name}</span>
        </div>
        <svg 
          className={`dropdown-arrow ${isOpen ? 'open' : ''}`} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <polyline points="6,9 12,15 18,9"></polyline>
        </svg>
      </button>
      
      <div className="language-selector-label">
        {t('language')}
      </div>

      {isOpen && (
        <div 
          className="language-dropdown"
          onMouseLeave={() => setIsOpen(false)}
        >
          {availableLanguages.map((language) => (
            <button
              key={language.code}
              className={`language-option ${language.code === currentLang.code ? 'active' : ''}`}
              onClick={() => handleLanguageSelect(language.code)}
            >
              <div className="option-content">
                <img src={language.flag} alt={language.name} className="option-flag" />
                <span className="option-name">{language.name}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
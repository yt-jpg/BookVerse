import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import Logo from '../Logo/Logo';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import LanguageSelector from '../LanguageSelector/LanguageSelector';
import BackButton from '../BackButton/BackButton';
import Modal from '../Modal/Modal';
import Captcha from '../Captcha/Captcha';
import axios from 'axios';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('info');
  const [captchaValid, setCaptchaValid] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!captchaValid) {
      setMessage(t('completeCaptcha'));
      setLoading(false);
      return;
    }
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', {
        email
      });

      if (response.data.emailExists) {
        setMessage(t('emailSentMessage'));
        setModalType('success');
      }
    } catch (error) {
      if (error.response?.status === 404) {
        // Email não encontrado
        setModalType('warning');
        setShowModal(true);
      } else {
        setMessage(t('errorProcessingRequest'));
      }
    }
    
    setLoading(false);
  };

  const handleModalConfirm = () => {
    setShowModal(false);
    navigate('/register');
  };

  const handleModalCancel = () => {
    setShowModal(false);
  };

  return (
    <div className="auth-container">
      <BackButton />
      
      <div className="auth-controls">
        <LanguageSelector />
        <ThemeToggle />
      </div>
      
      <div className="auth-card card glass-effect fade-in">
        <div className="auth-header">
          <Logo size="large" />
        </div>
        
        <h2>{t('forgotPasswordTitle')}</h2>
        <p className="auth-subtitle">{t('forgotPasswordSubtitle')}</p>
        
        {message ? (
          <div className="success-message slide-in">
            <p>{message}</p>
            <Link to="/login" className="btn-primary auth-button">
              <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              {t('makeLogin')}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>{t('email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                required
              />
            </div>

            <Captcha 
              onVerify={setCaptchaValid}
              isValid={captchaValid}
              setIsValid={setCaptchaValid}
            />

            <button type="submit" disabled={loading || !captchaValid} className="btn-primary auth-button">
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  {t('sendingInstructions')}
                </>
              ) : (
                <>
                  <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  {t('sendInstructions')}
                </>
              )}
            </button>
          </form>
        )}

        <div className="auth-divider">
          <span>{t('or')}</span>
        </div>

        <div className="auth-links">
          <p>{t('rememberedPassword')}</p>
          <Link to="/login" className="btn-secondary login-btn">
            <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M21 12H9"/>
            </svg>
            {t('makeLogin')}
          </Link>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={handleModalCancel}
        title={t('emailNotFound')}
        message={t('emailNotFoundMessage')}
        onConfirm={handleModalConfirm}
        confirmText={t('createAccountModal')}
        cancelText={t('cancel')}
        type={modalType}
      />
    </div>
  );
};

export default ForgotPassword;
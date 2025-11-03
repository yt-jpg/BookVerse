import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Logo from '../Logo/Logo';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import LanguageSelector from '../LanguageSelector/LanguageSelector';
import PasswordInput from '../PasswordInput/PasswordInput';
import BackButton from '../BackButton/BackButton';
import Captcha from '../Captcha/Captcha';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaValid, setCaptchaValid] = useState(false);

  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');



    if (formData.password !== formData.confirmPassword) {
      setError(t('passwordsDontMatch'));
      setLoading(false);
      return;
    }

    if (!captchaValid) {
      setError(t('completeCaptcha'));
      setLoading(false);
      return;
    }

    try {
      const result = await register(formData.name, formData.email, formData.password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Erro desconhecido ao criar conta');
      }
    } catch (error) {
      setError('Erro inesperado ao criar conta');
    }
    
    setLoading(false);
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
        
        <h2>{t('joinBookVerse')}</h2>
        <p className="auth-subtitle">{t('createAccountExplore')}</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message slide-in">{error}</div>}
          
          <div className="form-group">
            <label>{t('fullName')}</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t('fullNamePlaceholder')}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('email')}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t('emailPlaceholder')}
              required
            />
          </div>

          <PasswordInput
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder={t('passwordPlaceholder')}
            required
            label={t('password')}
          />

          <PasswordInput
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder={t('confirmPasswordPlaceholder')}
            required
            label={t('confirmPassword')}
          />

          <Captcha 
            onVerify={setCaptchaValid}
            isValid={captchaValid}
            setIsValid={setCaptchaValid}
          />

          <button type="submit" disabled={loading || !captchaValid} className="btn-primary auth-button">
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                {t('registerLoading')}
              </>
            ) : (
              <>
                {t('createAccount')}
              </>
            )}
          </button>
        </form>


      </div>
    </div>
  );
};

export default Register;
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Logo from '../Logo/Logo';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import LanguageSelector from '../LanguageSelector/LanguageSelector';
import PasswordInput from '../PasswordInput/PasswordInput';


import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


  const { login } = useAuth();
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



    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-controls">
        <LanguageSelector />
        <ThemeToggle />
      </div>
      
      <div className="auth-card card glass-effect fade-in">
        <div className="auth-header">
          <Logo size="large" />
        </div>
        
        <h2>{t('welcomeBack')}</h2>
        <p className="auth-subtitle">{t('enterAccount')}</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message slide-in">{error}</div>}
          
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



          <div className="auth-options">
            <Link to="/forgot-password" className="forgot-link">
              {t('forgotPassword')}
            </Link>
          </div>

          <button type="submit" disabled={loading} className="btn-primary auth-button">
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                {t('loginLoading')}
              </>
            ) : (
              <>
                {t('login')}
              </>
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>{t('or')}</span>
        </div>

        <div className="auth-links">
          <p>{t('noAccount')}</p>
          <Link to="/register" className="btn-secondary register-btn">
            {t('createFreeAccount')}
          </Link>
        </div>


      </div>
    </div>
  );
};

export default Login;
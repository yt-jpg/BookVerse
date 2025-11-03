import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../Logo/Logo';
import PasswordInput from '../PasswordInput/PasswordInput';
import './Auth.css';

const SupremeLogin = () => {
  const [formData, setFormData] = useState({
    email: 'admin@bookverse.com',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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

    try {
      const response = await fetch('/api/auth/supreme-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        // Salvar token e dados do usuário
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        // Redirecionar para dashboard supremo
        navigate('/supreme-dashboard');
      } else {
        setError(result.message || 'Erro ao fazer login');
      }
    } catch (error) {
      setError('Erro de conexão. Tente novamente.');
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card card glass-effect fade-in">
        <div className="auth-header">
          <Logo size="large" />
        </div>
        
        <h2>👑 Administrador Supremo</h2>
        <p className="auth-subtitle">Acesso total ao sistema - Use apenas em caso de necessidade</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message slide-in">{error}</div>}
          
          <div className="form-group">
            <label>📧 Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@bookverse.com"
              required
              readOnly
              style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
            />
          </div>

          <PasswordInput
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Digite a senha suprema"
            required
            label="🔐 Senha Suprema:"
          />

          <button type="submit" disabled={loading} className="btn-primary auth-button">
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Verificando...
              </>
            ) : (
              <>
                👑 Acessar Dashboard Supremo
              </>
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>ou</span>
        </div>

        <div className="auth-links">
          <p>Usuário comum?</p>
          <button 
            onClick={() => navigate('/login')} 
            className="btn-secondary login-btn"
          >
            🔑 Login Normal
          </button>
        </div>

        <div className="supreme-info">
          <div className="info-box">
            <h4>ℹ️ Informações Importantes:</h4>
            <ul>
              <li>Este é o acesso de emergência ao sistema</li>
              <li>Funciona mesmo sem banco configurado</li>
              <li>Permite configurar o sistema completo</li>
              <li>Use apenas quando necessário</li>
            </ul>
          </div>
          
          <div className="credentials-box">
            <h4>🔑 Credenciais Padrão:</h4>
            <p><strong>Email:</strong> admin@bookverse.com</p>
            <p><strong>Senha:</strong> password</p>
            <small>⚠️ Altere essas credenciais em produção!</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupremeLogin;
import { useState } from 'react';
import Logo from '../Logo/Logo';
import BackButton from '../BackButton/BackButton';
import './DatabaseAuth.css';

const DatabaseAuth = ({ onAuthenticated }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    tempCode: ''
  });
  const [tempPassword, setTempPassword] = useState('');
  const [timeLeft, setTimeLeft] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTempAuth, setShowTempAuth] = useState(false);

  // Gerar senha temporária
  const generateTempPassword = async () => {
    setIsGenerating(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/admin/generate-temp-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        setTempPassword(result.tempPassword);
        setTimeLeft(10);
        setShowTempAuth(true);
        startCountdown();
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Erro ao gerar senha temporária');
    }
    
    setIsGenerating(false);
  };

  // Countdown da senha temporária
  const startCountdown = () => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setTempPassword('');
          setShowTempAuth(false);
          setCredentials(prev => ({ ...prev, tempCode: '' }));
          return 10;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/admin/auth-database-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      const result = await response.json();
      
      if (response.ok) {
        onAuthenticated(result.token);
      } else {
        setError(result.message);
        if (result.resetTemp) {
          setTempPassword('');
          setShowTempAuth(false);
          setCredentials(prev => ({ ...prev, tempCode: '' }));
        }
      }
    } catch (error) {
      setError('Erro de conexão');
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <BackButton />
      
      <div className="database-auth-card card glass-effect fade-in">
        <div className="auth-header">
          <Logo size="large" />
        </div>
        
        <h2>🔐 Acesso Restrito</h2>
        <p className="auth-subtitle">Apenas Administradores Supremos</p>
        
        <form onSubmit={handleLogin} className="database-auth-form">
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <div className="form-group">
            <label>👤 Usuário Supremo:</label>
            <input
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              placeholder="admin_supremo"
              required
              disabled={showTempAuth}
            />
          </div>

          <div className="form-group">
            <label>🔒 Senha Master:</label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="••••••••••••"
              required
              disabled={showTempAuth}
            />
          </div>

          {!showTempAuth ? (
            <button 
              type="button" 
              onClick={generateTempPassword}
              disabled={isGenerating || !credentials.username || !credentials.password}
              className="btn-secondary generate-btn"
            >
              {isGenerating ? (
                <>
                  <span className="loading-spinner"></span>
                  Gerando...
                </>
              ) : (
                <>
                  🎲 Gerar Código Temporário
                </>
              )}
            </button>
          ) : (
            <div className="temp-auth-section">
              <div className="temp-password-display">
                <label>🔑 Código Temporário (válido por {timeLeft}s):</label>
                <div className="temp-password">
                  {tempPassword}
                </div>
                <div className="countdown-bar">
                  <div 
                    className="countdown-fill" 
                    style={{ width: `${(timeLeft / 10) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="form-group">
                <label>⏰ Digite o Código Temporário:</label>
                <input
                  type="text"
                  name="tempCode"
                  value={credentials.tempCode}
                  onChange={handleChange}
                  placeholder="Digite o código acima"
                  required
                  maxLength="8"
                  style={{ 
                    fontFamily: 'monospace', 
                    fontSize: '1.2rem', 
                    textAlign: 'center',
                    letterSpacing: '0.2em'
                  }}
                />
              </div>

              <button 
                type="submit" 
                disabled={loading || !credentials.tempCode}
                className="btn-primary auth-btn"
              >
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Verificando...
                  </>
                ) : (
                  <>
                    🚀 Acessar Configuração
                  </>
                )}
              </button>
            </div>
          )}
        </form>

        <div className="security-info">
          <h3>🛡️ Segurança:</h3>
          <ul>
            <li>• Códigos expiram em 10s</li>
            <li>• Não reutilizáveis</li>
            <li>• Tentativas registradas</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DatabaseAuth;
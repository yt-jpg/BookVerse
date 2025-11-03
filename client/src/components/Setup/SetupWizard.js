import { useState, useEffect } from 'react';
import Logo from '../Logo/Logo';
import './SetupWizard.css';

const SetupWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');


  const [setupData, setSetupData] = useState({
    // Configurações do banco
    database: {
      host: 'localhost',
      port: '3306',
      database: '',
      username: '',
      password: ''
    },
    // Configurações do admin
    admin: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      jwtSecret: ''
    },
    // Configurações da plataforma
    platform: {
      name: 'BookVerse',
      description: 'Plataforma de busca e download de livros',
      allowRegistration: true,
      requireEmailVerification: false
    }
  });

  useEffect(() => {
    // JWT Secret
    const generateJWTSecret = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      let result = '';
      for (let i = 0; i < 64; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    setSetupData(prev => ({
      ...prev,
      admin: {
        ...prev.admin,
        jwtSecret: generateJWTSecret()
      }
    }));
  }, []);

  const handleInputChange = (section, field, value) => {
    setSetupData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const testDatabaseConnection = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/setup/test-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(setupData.database)
      });

      const result = await response.json();

      if (result.success) {
        setMessage('✅ Conexão com banco testada com sucesso!');
        setMessageType('success');
      } else {
        setMessage(`❌ Erro: ${result.error}`);
        setMessageType('error');
      }
    } catch (error) {
      setMessage(`❌ Erro de conexão: ${error.message}`);
      setMessageType('error');
    }

    setLoading(false);
  };

  const completeSetup = async () => {
    setLoading(true);
    setMessage('');

    // Validações
    if (setupData.admin.password !== setupData.admin.confirmPassword) {
      setMessage('❌ Senhas não coincidem');
      setMessageType('error');
      setLoading(false);
      return;
    }

    if (setupData.admin.password.length < 6) {
      setMessage('❌ Senha deve ter pelo menos 6 caracteres');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/setup/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(setupData)
      });

      const result = await response.json();

      if (result.success) {
        setMessage('🎉 Setup concluído com sucesso! Redirecionando...');
        setMessageType('success');
        
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        setMessage(`❌ Erro: ${result.error}`);
        setMessageType('error');
      }
    } catch (error) {
      setMessage(`❌ Erro: ${error.message}`);
      setMessageType('error');
    }

    setLoading(false);
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      setMessage('');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setMessage('');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="setup-step">
            <h2>🎉 Bem-vindo ao BookVerse!</h2>
            <p>Vamos configurar sua plataforma de livros em alguns passos simples.</p>
            
            <div className="welcome-info">
              <div className="info-item">
                <span className="icon">🗄️</span>
                <div>
                  <h4>Banco de Dados</h4>
                  <p>Configure a conexão com seu banco MySQL/MariaDB</p>
                </div>
              </div>
              
              <div className="info-item">
                <span className="icon">👤</span>
                <div>
                  <h4>Administrador</h4>
                  <p>Crie sua conta de administrador</p>
                </div>
              </div>
              
              <div className="info-item">
                <span className="icon">⚙️</span>
                <div>
                  <h4>Configurações</h4>
                  <p>Personalize sua plataforma</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="setup-step">
            <h2>🗄️ Configuração do Banco de Dados</h2>
            <p>Insira as informações de conexão do seu banco MySQL/MariaDB:</p>
            
            <div className="form-grid">
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Host (ex: localhost)"
                  value={setupData.database.host}
                  onChange={(e) => handleInputChange('database', 'host', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Porta (3306)"
                  value={setupData.database.port}
                  onChange={(e) => handleInputChange('database', 'port', e.target.value)}
                />
              </div>
              
              <input
                type="text"
                placeholder="Nome do Banco de Dados"
                value={setupData.database.database}
                onChange={(e) => handleInputChange('database', 'database', e.target.value)}
                required
              />
              
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Usuário"
                  value={setupData.database.username}
                  onChange={(e) => handleInputChange('database', 'username', e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Senha"
                  value={setupData.database.password}
                  onChange={(e) => handleInputChange('database', 'password', e.target.value)}
                  required
                />
              </div>
            </div>
            
            <button 
              type="button" 
              onClick={testDatabaseConnection}
              disabled={loading}
              className="btn-test"
            >
              {loading ? '⏳ Testando...' : '🧪 Testar Conexão'}
            </button>
          </div>
        );

      case 3:
        return (
          <div className="setup-step">
            <h2>👤 Criar Administrador</h2>
            <p>Configure sua conta de administrador:</p>
            
            <div className="form-grid">
              <input
                type="text"
                placeholder="Nome Completo"
                value={setupData.admin.name}
                onChange={(e) => handleInputChange('admin', 'name', e.target.value)}
                required
              />
              
              <input
                type="email"
                placeholder="Email"
                value={setupData.admin.email}
                onChange={(e) => handleInputChange('admin', 'email', e.target.value)}
                required
              />
              
              <div className="form-row">
                <input
                  type="password"
                  placeholder="Senha"
                  value={setupData.admin.password}
                  onChange={(e) => handleInputChange('admin', 'password', e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Confirmar Senha"
                  value={setupData.admin.confirmPassword}
                  onChange={(e) => handleInputChange('admin', 'confirmPassword', e.target.value)}
                  required
                />
              </div>
              
              <div className="jwt-secret">
                <label>JWT Secret (gerado automaticamente):</label>
                <textarea
                  value={setupData.admin.jwtSecret}
                  onChange={(e) => handleInputChange('admin', 'jwtSecret', e.target.value)}
                  rows="3"
                  placeholder="Chave secreta para tokens JWT"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="setup-step">
            <h2>⚙️ Configurações da Plataforma</h2>
            <p>Personalize sua plataforma:</p>
            
            <div className="form-grid">
              <input
                type="text"
                placeholder="Nome da Plataforma"
                value={setupData.platform.name}
                onChange={(e) => handleInputChange('platform', 'name', e.target.value)}
              />
              
              <textarea
                placeholder="Descrição da Plataforma"
                value={setupData.platform.description}
                onChange={(e) => handleInputChange('platform', 'description', e.target.value)}
                rows="3"
              />
              
              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={setupData.platform.allowRegistration}
                    onChange={(e) => handleInputChange('platform', 'allowRegistration', e.target.checked)}
                  />
                  Permitir registro de novos usuários
                </label>
                
                <label>
                  <input
                    type="checkbox"
                    checked={setupData.platform.requireEmailVerification}
                    onChange={(e) => handleInputChange('platform', 'requireEmailVerification', e.target.checked)}
                  />
                  Exigir verificação de email
                </label>
              </div>
            </div>
            
            <div className="setup-summary">
              <h3>📋 Resumo da Configuração:</h3>
              <div className="summary-item">
                <strong>Banco:</strong> {setupData.database.username}@{setupData.database.host}:{setupData.database.port}/{setupData.database.database}
              </div>
              <div className="summary-item">
                <strong>Admin:</strong> {setupData.admin.name} ({setupData.admin.email})
              </div>
              <div className="summary-item">
                <strong>Plataforma:</strong> {setupData.platform.name}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="setup-container">
      <div className="setup-card">
        <div className="setup-header">
          <Logo size="large" />
          <div className="setup-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(currentStep / 4) * 100}%` }}
              ></div>
            </div>
            <span>Passo {currentStep} de 4</span>
          </div>
        </div>

        <div className="setup-content">
          {renderStep()}
          
          {message && (
            <div className={`message ${messageType}`}>
              {message}
            </div>
          )}
        </div>

        <div className="setup-actions">
          {currentStep > 1 && (
            <button 
              onClick={prevStep}
              disabled={loading}
              className="btn-secondary"
            >
              ← Anterior
            </button>
          )}
          
          {currentStep < 4 ? (
            <button 
              onClick={nextStep}
              disabled={loading}
              className="btn-primary"
            >
              Próximo →
            </button>
          ) : (
            <button 
              onClick={completeSetup}
              disabled={loading}
              className="btn-success"
            >
              {loading ? '⏳ Configurando...' : '🎉 Finalizar Setup'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;
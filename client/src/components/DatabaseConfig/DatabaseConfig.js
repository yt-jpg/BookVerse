import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatabaseAuth from './DatabaseAuth';
import InitialSetup from './InitialSetup';
import Logo from '../Logo/Logo';
import BackButton from '../BackButton/BackButton';
import './DatabaseConfig.css';

const DatabaseConfig = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState('');
  const [isFirstSetup, setIsFirstSetup] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);
  const [config, setConfig] = useState({
    host: 'localhost',
    port: '3306',
    database: 'kaptcaqn_TESTANDO',
    username: 'kaptcaqn_TESTANDO',
    password: 'fssbJQs3mumu2vJXP7pT',
    dbType: 'mariadb'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    checkIfFirstSetup();
  }, []);

  const checkIfFirstSetup = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/check-setup-status');
      const result = await response.json();
      setIsFirstSetup(result.isFirstSetup);
    } catch (error) {
      console.error('Erro ao verificar status do setup:', error);
      setIsFirstSetup(false);
    }
    setCheckingSetup(false);
  };

  const handleAuthenticated = (token) => {
    setAuthToken(token);
    setIsAuthenticated(true);
  };

  const handleSetupComplete = () => {
    setIsFirstSetup(false);
  };

  if (checkingSetup) {
    return (
      <div className="auth-container">
        <div className="loading-setup">
          <Logo size="large" />
          <p>Verificando configuração...</p>
        </div>
      </div>
    );
  }

  if (isFirstSetup) {
    return <InitialSetup onSetupComplete={handleSetupComplete} />;
  }

  if (!isAuthenticated) {
    return <DatabaseAuth onAuthenticated={handleAuthenticated} />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateConnectionString = () => {
    if (config.dbType === 'mongodb') {
      return `mongodb+srv://${config.username}:${config.password}@${config.host}/${config.database}`;
    } else {
      return `mysql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;
    }
  };

  const testConnection = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const connectionString = generateConnectionString();
      
      const response = await fetch('http://localhost:5000/api/admin/test-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ connectionString, token: authToken })
      });

      const result = await response.json();
      
      if (response.ok) {
        setMessage(`✅ Conexão bem-sucedida! ${result.type === 'mariadb' ? 'MariaDB' : 'MongoDB'} está funcionando.`);
        setMessageType('success');
      } else {
        // Mensagens de erro mais específicas
        let errorMsg = result.error || result.message;
        if (errorMsg.includes('Access denied')) {
          errorMsg = '🔐 Acesso negado: Verifique usuário e senha';
        } else if (errorMsg.includes('ECONNREFUSED')) {
          errorMsg = '🔌 Conexão recusada: Verifique host e porta';
        } else if (errorMsg.includes('Unknown database')) {
          errorMsg = '🗄️ Banco não encontrado: Verifique o nome do banco';
        } else if (errorMsg.includes('getaddrinfo ENOTFOUND')) {
          errorMsg = '🌐 Host não encontrado: Verifique o endereço do servidor';
        }
        setMessage(`❌ ${errorMsg}`);
        setMessageType('error');
      }
    } catch (error) {
      setMessage(`❌ Erro de conexão: ${error.message}`);
      setMessageType('error');
    }
    
    setLoading(false);
  };

  const saveConfiguration = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const connectionString = generateConnectionString();
      
      const response = await fetch('http://localhost:5000/api/admin/save-db-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ connectionString, token: authToken })
      });

      const result = await response.json();
      
      if (response.ok) {
        setMessage('✅ Salvo! Reiniciando...');
        setMessageType('success');
        
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setMessage(`❌ ${result.message}`);
        setMessageType('error');
      }
    } catch (error) {
      setMessage(`❌ Erro: ${error.message}`);
      setMessageType('error');
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <BackButton />
      
      <div className="database-config-card card glass-effect fade-in">
        <div className="config-header">
          <Logo size="small" />
          <h2>🍃 Configurar Banco</h2>
        </div>

        <div className="config-tabs">
          <button 
            className={`tab-btn ${config.dbType === 'mongodb' ? 'active' : ''}`}
            onClick={() => setConfig(prev => ({ ...prev, dbType: 'mongodb', port: '27017' }))}
          >
            MongoDB
          </button>
          <button 
            className={`tab-btn ${config.dbType === 'mariadb' ? 'active' : ''}`}
            onClick={() => setConfig(prev => ({ ...prev, dbType: 'mariadb', port: '3306' }))}
          >
            MariaDB
          </button>
        </div>

        <form className="config-form">
          <div className="form-row">
            <input
              type="text"
              name="host"
              value={config.host}
              onChange={handleChange}
              placeholder={config.dbType === 'mongodb' ? "cluster0.xxxxx.mongodb.net" : "seu-servidor.com"}
              required
            />
            <input
              type="number"
              name="port"
              value={config.port}
              onChange={handleChange}
              placeholder={config.dbType === 'mongodb' ? "27017" : "3306"}
              className="port-input"
              required
            />
          </div>

          <input
            type="text"
            name="database"
            value={config.database}
            onChange={handleChange}
            placeholder="Nome do banco"
            required
          />

          <div className="form-row">
            <input
              type="text"
              name="username"
              value={config.username}
              onChange={handleChange}
              placeholder="Usuário"
              required
            />
            <input
              type="password"
              name="password"
              value={config.password}
              onChange={handleChange}
              placeholder="Senha"
              required
            />
          </div>

          <div className="connection-preview">
            <small>🔗 {generateConnectionString()}</small>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={testConnection}
              disabled={loading}
              className="btn-test"
            >
              {loading ? '⏳' : '🧪'} Testar
            </button>

            <button 
              type="button" 
              onClick={saveConfiguration}
              disabled={loading}
              className="btn-save"
            >
              {loading ? '⏳' : '💾'} Salvar
            </button>
          </div>

          {message && (
            <div className={`message ${messageType}`}>
              {message}
            </div>
          )}
        </form>

        <div className="quick-links">
          <a href="https://mariadb.org/documentation/" target="_blank" rel="noopener noreferrer">
            📖 MariaDB Docs
          </a>
          <a href="https://www.mongodb.com/atlas" target="_blank" rel="noopener noreferrer">
            🌟 MongoDB Atlas
          </a>
        </div>
      </div>
    </div>
  );
};

export default DatabaseConfig;
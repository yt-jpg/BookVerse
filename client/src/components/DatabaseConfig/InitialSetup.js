import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../Logo/Logo';
import './InitialSetup.css';

const InitialSetup = ({ onSetupComplete }) => {
  const [config, setConfig] = useState({
    host: '',
    port: '3306',
    database: 'bookplatform',
    username: '',
    password: '',
    dbType: 'mariadb'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const navigate = useNavigate();

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
      
      const response = await fetch('http://localhost:5000/api/admin/initial-setup-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ connectionString })
      });

      const result = await response.json();
      
      if (response.ok) {
        setMessage(`✅ Conexão bem-sucedida! ${result.type === 'mariadb' ? 'MariaDB' : 'MongoDB'} está funcionando.`);
        setMessageType('success');
      } else {
        // Erro específico
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

  const completeSetup = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const connectionString = generateConnectionString();
      
      const response = await fetch('http://localhost:5000/api/admin/complete-initial-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ connectionString })
      });

      const result = await response.json();
      
      if (response.ok) {
        setMessage('✅ Setup concluído! Sistema configurado com sucesso!');
        setMessageType('success');
        
        setTimeout(() => {
          onSetupComplete();
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
      <div className="initial-setup-card card glass-effect fade-in">
        <div className="setup-header">
          <Logo size="medium" />
          <h1>🚀 Configuração Inicial</h1>
          <p className="setup-subtitle">Configure seu banco de dados para começar</p>
        </div>

        <div className="setup-info">
          <div className="info-card">
            <h3>📋 Primeira Configuração</h3>
            <p>Esta é a configuração inicial do BookVerse. Após configurar o banco de dados, esta página ficará protegida e só poderá ser acessada por administradores supremos.</p>
          </div>
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

        <form className="setup-form">
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
              {loading ? '⏳' : '🧪'} Testar Conexão
            </button>

            <button 
              type="button" 
              onClick={completeSetup}
              disabled={loading}
              className="btn-complete"
            >
              {loading ? '⏳' : '🎯'} Concluir Setup
            </button>
          </div>

          {message && (
            <div className={`message ${messageType}`}>
              {message}
            </div>
          )}
        </form>

        <div className="setup-warning">
          <div className="warning-card">
            <h4>⚠️ Importante</h4>
            <ul>
              <li>• Após concluir, esta página ficará protegida</li>
              <li>• Apenas administradores supremos poderão acessar</li>
              <li>• Certifique-se de que a conexão está funcionando</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InitialSetup;
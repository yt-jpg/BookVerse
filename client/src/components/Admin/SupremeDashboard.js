import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../Logo/Logo';
import Notifications from '../Notifications/Notifications';
import './AdminDashboard.css';

const SupremeDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/supreme-login');
        return;
      }

      const response = await fetch('/api/admin/supreme-dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        setError('Erro ao carregar dashboard');
        navigate('/supreme-login');
      }
    } catch (error) {
      setError('Erro de conexão');
    }
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleAction = (action) => {
    switch (action) {
      case 'setup':
        navigate('/setup');
        break;
      case 'database':
        navigate('/database-config');
        break;
      case 'logs':
        alert('Funcionalidade de logs em desenvolvimento');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-screen">
          <Logo size="large" />
          <p>Carregando dashboard supremo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container">
        <div className="error-screen">
          <h2>❌ Erro</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/supreme-login')} className="btn-primary">
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="header-left">
          <Logo size="medium" />
          <div className="admin-title">
            <h1>👑 Dashboard Supremo</h1>
            <p>Controle total do sistema BookVerse</p>
          </div>
        </div>
        <div className="header-right">
          <div className="admin-info">
            <span className="admin-name">{dashboardData?.adminInfo?.name}</span>
            <span className="admin-role">{dashboardData?.adminInfo?.role}</span>
          </div>
          <Notifications />
          <button onClick={handleLogout} className="btn-logout">
            🚪 Sair
          </button>
        </div>
      </div>

      <div className="admin-content">
        {/* Status do Sistema */}
        <div className="dashboard-section">
          <h2>📊 Status do Sistema</h2>
          <div className="status-grid">
            <div className="status-card">
              <div className="status-icon">🚀</div>
              <div className="status-info">
                <h3>Servidor</h3>
                <p className={dashboardData?.systemStatus?.serverRunning ? 'status-online' : 'status-offline'}>
                  {dashboardData?.systemStatus?.serverRunning ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>

            <div className="status-card">
              <div className="status-icon">🗄️</div>
              <div className="status-info">
                <h3>Banco de Dados</h3>
                <p className={dashboardData?.systemStatus?.dbConnected ? 'status-online' : 'status-offline'}>
                  {dashboardData?.systemStatus?.dbConnected ? 'Conectado' : 'Desconectado'}
                </p>
              </div>
            </div>

            <div className="status-card">
              <div className="status-icon">⚙️</div>
              <div className="status-info">
                <h3>Setup</h3>
                <p className={dashboardData?.systemStatus?.setupCompleted ? 'status-online' : 'status-warning'}>
                  {dashboardData?.systemStatus?.setupCompleted ? 'Concluído' : 'Pendente'}
                </p>
              </div>
            </div>

            <div className="status-card">
              <div className="status-icon">🔧</div>
              <div className="status-info">
                <h3>Modo</h3>
                <p className="status-info-text">
                  {dashboardData?.systemStatus?.mode || 'Desenvolvimento'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="dashboard-section">
          <h2>⚡ Ações Rápidas</h2>
          <div className="actions-grid">
            {dashboardData?.quickActions?.map((action, index) => (
              <div 
                key={index} 
                className={`action-card ${!action.available ? 'disabled' : ''}`}
                onClick={() => action.available && handleAction(action.action)}
              >
                <h3>{action.title}</h3>
                <p>{action.description}</p>
                <div className="action-status">
                  {action.available ? (
                    <span className="status-available">✅ Disponível</span>
                  ) : (
                    <span className="status-unavailable">❌ Indisponível</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Informações do Admin */}
        <div className="dashboard-section">
          <h2>👤 Informações do Administrador</h2>
          <div className="admin-details">
            <div className="detail-item">
              <strong>Nome:</strong> {dashboardData?.adminInfo?.name}
            </div>
            <div className="detail-item">
              <strong>Email:</strong> {dashboardData?.adminInfo?.email}
            </div>
            <div className="detail-item">
              <strong>Função:</strong> {dashboardData?.adminInfo?.role}
            </div>
            <div className="detail-item">
              <strong>Permissões:</strong>
              <div className="permissions-list">
                {dashboardData?.adminInfo?.permissions?.map((permission, index) => (
                  <span key={index} className="permission-badge">
                    {permission.replace('_', ' ').toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Avisos Importantes */}
        <div className="dashboard-section">
          <h2>⚠️ Avisos Importantes</h2>
          <div className="warnings-list">
            {!dashboardData?.systemStatus?.setupCompleted && (
              <div className="warning-item warning-high">
                <span className="warning-icon">🚨</span>
                <div className="warning-content">
                  <h4>Setup Não Concluído</h4>
                  <p>O sistema ainda não foi configurado completamente. Execute o setup inicial.</p>
                </div>
              </div>
            )}
            
            {!dashboardData?.systemStatus?.dbConnected && (
              <div className="warning-item warning-medium">
                <span className="warning-icon">⚠️</span>
                <div className="warning-content">
                  <h4>Banco de Dados Desconectado</h4>
                  <p>Configure a conexão com o banco de dados para funcionalidade completa.</p>
                </div>
              </div>
            )}

            <div className="warning-item warning-low">
              <span className="warning-icon">🔐</span>
              <div className="warning-content">
                <h4>Credenciais Padrão</h4>
                <p>Altere as credenciais padrão do administrador supremo em produção.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupremeDashboard;
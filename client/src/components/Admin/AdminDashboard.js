import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../Logo/Logo';
import Notifications from '../Notifications/Notifications';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'info',
    isGlobal: true
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'books') {
      loadBooks();
    } else if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);

  const loadDashboardData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const loadBooks = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/admin/books');
      setBooks(response.data);
    } catch (error) {
      console.error('Erro ao carregar livros:', error);
    }
    setLoading(false);
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
    setLoading(false);
  };

  const sendNotification = async (e) => {
    e.preventDefault();
    
    if (!notificationForm.title || !notificationForm.message) {
      alert('Título e mensagem são obrigatórios');
      return;
    }

    try {
      setLoading(true);
      console.log('📤 Enviando notificação:', notificationForm);
      
      const response = await axios.post('http://localhost:5000/api/notifications', notificationForm);
      
      console.log('✅ Resposta do servidor:', response.data);
      alert('Notificação enviada com sucesso!');
      
      setNotificationForm({
        title: '',
        message: '',
        type: 'info',
        isGlobal: true
      });
    } catch (error) {
      console.error('❌ Erro detalhado ao enviar notificação:', error);
      console.error('❌ Status:', error.response?.status);
      console.error('❌ Dados:', error.response?.data);
      console.error('❌ Headers:', error.response?.headers);
      
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido';
      alert(`Erro ao enviar notificação: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Função para enviar notificação de teste rápido
  const sendQuickNotification = async (type) => {
    const testMessages = {
      info: {
        title: '📘 Teste de Informação',
        message: 'Esta é uma notificação de teste do tipo informação. Tudo funcionando perfeitamente!'
      },
      success: {
        title: '✅ Teste de Sucesso',
        message: 'Parabéns! Esta é uma notificação de sucesso. O sistema está operacional!'
      },
      warning: {
        title: '⚠️ Teste de Aviso',
        message: 'Atenção! Esta é uma notificação de aviso para testar o sistema de alertas.'
      },
      error: {
        title: '🚨 Teste de Erro',
        message: 'Alerta! Esta é uma notificação de erro para testar situações críticas.'
      }
    };

    const testNotification = {
      ...testMessages[type],
      type: type,
      isGlobal: true
    };

    try {
      setLoading(true);
      console.log('🧪 Enviando notificação de teste:', testNotification);
      
      const response = await axios.post('http://localhost:5000/api/notifications', testNotification);
      
      console.log('✅ Notificação de teste enviada:', response.data);
      alert(`Notificação de teste (${type}) enviada com sucesso!`);
    } catch (error) {
      console.error('❌ Erro ao enviar notificação de teste:', error);
      alert(`Erro ao enviar notificação de teste: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateBookStatus = async (bookId, status) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/books/${bookId}/status`, { status });
      loadBooks(); // Recarregar lista
      loadDashboardData(); // Atualizar estatísticas
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const deleteBook = async (bookId) => {
    if (window.confirm('Tem certeza que deseja deletar este livro?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/books/${bookId}`);
        loadBooks();
        loadDashboardData();
      } catch (error) {
        console.error('Erro ao deletar livro:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#28a745';
      case 'rejected': return '#dc3545';
      case 'pending': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Aprovado';
      case 'rejected': return 'Rejeitado';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="header-left">
          <Logo size="small" />
          <h1>⚙️ Painel Administrativo</h1>
        </div>
        <div className="admin-user-info">
          <span className="admin-welcome">Admin: {user.name} 👨‍💼</span>
          <Notifications />
          <a href="/dashboard" className="btn-secondary user-dashboard-link">
            👤 Dashboard Usuário
          </a>
          <button onClick={logout} className="btn-danger logout-btn">
            🚪 Sair
          </button>
        </div>
      </header>

      <nav className="admin-nav">
        <button 
          className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Visão Geral
        </button>
        <button 
          className={`nav-btn ${activeTab === 'books' ? 'active' : ''}`}
          onClick={() => setActiveTab('books')}
        >
          📚 Gerenciar Livros
        </button>
        <button 
          className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Usuários
        </button>
        
        <button 
          className={`nav-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          🔔 Notificações
        </button>
        <button 
          className={`nav-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          🔐 Segurança
        </button>
      </nav>

      <main className="admin-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <h2>Estatísticas da Plataforma</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total de Usuários</h3>
                <div className="stat-number">{stats.totalUsers || 0}</div>
              </div>
              <div className="stat-card">
                <h3>Total de Livros</h3>
                <div className="stat-number">{stats.totalBooks || 0}</div>
              </div>
              <div className="stat-card">
                <h3>Livros Pendentes</h3>
                <div className="stat-number">{stats.pendingBooks || 0}</div>
              </div>
              <div className="stat-card">
                <h3>Total de Downloads</h3>
                <div className="stat-number">{stats.totalDownloads || 0}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'books' && (
          <div className="books-section">
            <h2>Gerenciar Livros</h2>
            {loading ? (
              <div className="loading">Carregando...</div>
            ) : (
              <div className="books-table">
                {books.map(book => (
                  <div key={book._id} className="book-item">
                    <div className="book-info">
                      <h3>{book.title}</h3>
                      <p><strong>Autor:</strong> {book.author}</p>
                      <p><strong>Categoria:</strong> {book.category || 'Não especificada'}</p>
                      <p><strong>Adicionado por:</strong> {book.addedBy.name} ({book.addedBy.email})</p>
                      <p><strong>Downloads:</strong> {book.downloads}</p>
                      <p><strong>Data:</strong> {new Date(book.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                    
                    <div className="book-status">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(book.status) }}
                      >
                        {getStatusText(book.status)}
                      </span>
                    </div>

                    <div className="book-actions">
                      {book.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => updateBookStatus(book._id, 'approved')}
                            className="btn-success approve-btn"
                          >
                            ✅ Aprovar
                          </button>
                          <button 
                            onClick={() => updateBookStatus(book._id, 'rejected')}
                            className="btn-warning reject-btn"
                          >
                            ❌ Rejeitar
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => deleteBook(book._id)}
                        className="btn-danger delete-btn"
                      >
                        🗑️ Deletar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-section">
            <h2>Usuários da Plataforma</h2>
            {loading ? (
              <div className="loading">Carregando...</div>
            ) : (
              <div className="users-table">
                {users.map(user => (
                  <div key={user._id} className="user-item">
                    <div className="user-info">
                      <h3>{user.name}</h3>
                      <p><strong>Email:</strong> {user.email}</p>
                      <p><strong>Cadastrado em:</strong> {new Date(user.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="notifications-section">
            <h2>🔔 Gerenciar Notificações</h2>
            
            {/* Botões de Teste Rápido */}
            <div className="quick-test-section">
              <h3>🧪 Teste Rápido de Notificações</h3>
              <div className="quick-test-buttons">
                <button 
                  type="button"
                  className="btn-test btn-info"
                  onClick={() => sendQuickNotification('info')}
                >
                  📘 Teste Info
                </button>
                <button 
                  type="button"
                  className="btn-test btn-success"
                  onClick={() => sendQuickNotification('success')}
                >
                  ✅ Teste Sucesso
                </button>
                <button 
                  type="button"
                  className="btn-test btn-warning"
                  onClick={() => sendQuickNotification('warning')}
                >
                  ⚠️ Teste Aviso
                </button>
                <button 
                  type="button"
                  className="btn-test btn-error"
                  onClick={() => sendQuickNotification('error')}
                >
                  🚨 Teste Erro
                </button>
              </div>
              <p className="test-description">
                Use estes botões para testar rapidamente as notificações em tempo real. 
                Elas serão enviadas para todos os usuários conectados.
              </p>
            </div>
            
            <div className="notification-form-container">
              <h3>Enviar Nova Notificação</h3>
              
              <form onSubmit={sendNotification} className="notification-form">
                <div className="form-group">
                  <label htmlFor="title">Título da Notificação</label>
                  <input
                    type="text"
                    id="title"
                    value={notificationForm.title}
                    onChange={(e) => setNotificationForm({
                      ...notificationForm,
                      title: e.target.value
                    })}
                    placeholder="Digite o título da notificação"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Mensagem</label>
                  <textarea
                    id="message"
                    rows="4"
                    value={notificationForm.message}
                    onChange={(e) => setNotificationForm({
                      ...notificationForm,
                      message: e.target.value
                    })}
                    placeholder="Digite a mensagem da notificação"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="type">Tipo de Notificação</label>
                    <select
                      id="type"
                      value={notificationForm.type}
                      onChange={(e) => setNotificationForm({
                        ...notificationForm,
                        type: e.target.value
                      })}
                    >
                      <option value="info">ℹ️ Informação</option>
                      <option value="success">✅ Sucesso</option>
                      <option value="warning">⚠️ Aviso</option>
                      <option value="error">❌ Erro</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={notificationForm.isGlobal}
                        onChange={(e) => setNotificationForm({
                          ...notificationForm,
                          isGlobal: e.target.checked
                        })}
                      />
                      Enviar para todos os usuários
                    </label>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Enviando...' : '📤 Enviar Notificação'}
                </button>
              </form>
            </div>

            <div className="notification-tips">
              <h4>💡 Dicas para Notificações Eficazes</h4>
              <ul>
                <li><strong>Título claro:</strong> Use títulos descritivos e diretos</li>
                <li><strong>Mensagem concisa:</strong> Mantenha a mensagem objetiva</li>
                <li><strong>Tipo apropriado:</strong> Escolha o tipo correto para o contexto</li>
                <li><strong>Frequência:</strong> Evite spam - envie apenas quando necessário</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="security-section">
            <h2>🔐 Configurações de Segurança</h2>
            <div className="security-content">
              <div className="security-info">
                <h3>🛡️ Informações de Segurança</h3>
                <div className="info-grid">
                  <div className="info-card">
                    <h4>Credenciais do Administrador Supremo</h4>
                    <p><strong>Usuário:</strong> admin_supremo</p>
                    <p><strong>Senha:</strong> BookVerse2024!@#$%</p>
                  </div>
                  <div className="info-card">
                    <h4>Sistema de Autenticação</h4>
                    <ul>
                      <li>• Autenticação segura com JWT</li>
                      <li>• Senhas criptografadas com bcrypt</li>
                      <li>• Sessões com tempo de expiração</li>
                      <li>• Logs de acesso administrativo</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
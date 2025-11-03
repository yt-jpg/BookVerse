import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import axios from 'axios';
import io from 'socket.io-client';
import './Notifications.css';

const Notifications = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPushNotification, setShowPushNotification] = useState(false);
  const [latestNotification, setLatestNotification] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toastEnabled, setToastEnabled] = useState(true);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const dropdownRef = useRef(null);
  const pushNotificationRef = useRef(null);
  const audioContextRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (pushNotificationRef.current && !pushNotificationRef.current.contains(event.target)) {
        setShowPushNotification(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Som de notificação
  const playNotificationSound = useCallback(async (type = 'info') => {
    if (!soundEnabled) {
      return;
    }

    try {
      // Sempre criar um novo contexto para garantir funcionamento
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Verificar se precisa resumir o contexto
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Configurar frequência baseada no tipo
      let frequency, duration;
      switch (type) {
        case 'success':
          frequency = 800;
          duration = 0.3;
          break;
        case 'warning':
          frequency = 600;
          duration = 0.4;
          break;
        case 'error':
          frequency = 400;
          duration = 0.5;
          break;
        default: // info
          frequency = 700;
          duration = 0.25;
      }

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      // Volume
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);

    } catch (error) {
      // Fallback: tentar com Audio element
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
        audio.volume = 0.5;
        await audio.play();
      } catch (fallbackError) {
        // Silencioso se não conseguir tocar som
      }
    }
  }, [soundEnabled]);

  // Carregar notificações
  const loadNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/notifications');
      const newNotifications = response.data.notifications;
      const newUnreadCount = response.data.unreadCount;
      
      // Verificar se há novas notificações (melhor detecção)
      const hasNewNotifications = newNotifications.some(newNotif => 
        !notifications.some(oldNotif => oldNotif.id === newNotif.id)
      );

      if (hasNewNotifications && notifications.length > 0) {
        const latestNew = newNotifications[0];
        setLatestNotification(latestNew);
        
        // Mostrar toast apenas se estiver habilitado
        if (toastEnabled) {
          setShowPushNotification(true);
          
          // Esconder notificação toast após 6 segundos
          setTimeout(() => {
            setShowPushNotification(false);
          }, 6000);
        }
        
        // Tocar som da notificação (independente do toast)
        playNotificationSound(latestNew.type);
      }

      // Para primeira carga: sempre mostrar toast se não há notificações anteriores
      if (notifications.length === 0 && newNotifications.length > 0) {
        const latestNew = newNotifications[0];
        setLatestNotification(latestNew);
        
        if (toastEnabled) {
          setShowPushNotification(true);
          
          setTimeout(() => {
            setShowPushNotification(false);
          }, 6000);
        }
      }
      
      setNotifications(newNotifications);
      setUnreadCount(newUnreadCount);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  }, [user, notifications, toastEnabled, playNotificationSound]);

  useEffect(() => {
    if (user) {
      loadNotifications();
      
      // Configurar WebSocket
      const socket = io('http://localhost:5000', {
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 20000
      });
      
      socketRef.current = socket;
      
      // Eventos de conexão
      socket.on('connect', () => {
        setSocketConnected(true);
        socket.emit('register-user', user.id);
      });

      socket.on('disconnect', () => {
        setSocketConnected(false);
      });

      socket.on('reconnect', () => {
        setSocketConnected(true);
        socket.emit('register-user', user.id);
      });

      socket.on('reconnect_error', () => {
        setSocketConnected(false);
      });
      
      // Escutar novas notificações
      socket.on('new-notification', (notification) => {
        // Adicionar nova notificação ao estado
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Mostrar toast se habilitado
        if (toastEnabled) {
          setLatestNotification(notification);
          setShowPushNotification(true);
          
          // Esconder toast após 6 segundos
          setTimeout(() => {
            setShowPushNotification(false);
          }, 6000);
        }
        
        // Tocar som se habilitado
        if (soundEnabled) {
          playNotificationSound(notification.type);
        }
      });
      
      // Cleanup
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }
  }, [user, toastEnabled, soundEnabled, loadNotifications, playNotificationSound]);

  // Marcar notificação como lida
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/${notificationId}/read`);
      
      // Atualizar estado local
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  // Marcar todas como lidas
  const markAllAsRead = async () => {
    try {
      await axios.put('http://localhost:5000/api/notifications/read-all');
      
      // Atualizar estado local
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  // Inicializar contexto de áudio
  const initializeAudio = useCallback(async () => {
    if (audioInitialized) return;
    
    try {
      if (window.AudioContext || window.webkitAudioContext) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        
        setAudioInitialized(true);
      }
    } catch (error) {
      // Silencioso se não conseguir inicializar áudio
    }
  }, [audioInitialized]);

  // Preferências
  useEffect(() => {
    const savedSoundPreference = localStorage.getItem('notificationSoundEnabled');
    if (savedSoundPreference !== null) {
      setSoundEnabled(JSON.parse(savedSoundPreference));
    }

    const savedToastPreference = localStorage.getItem('notificationToastEnabled');
    if (savedToastPreference !== null) {
      setToastEnabled(JSON.parse(savedToastPreference));
    }

    // Inicializar áudio na primeira interação
    const handleFirstInteraction = () => {
      initializeAudio();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [initializeAudio]);

  // Alternar som
  const toggleSound = async () => {
    const newSoundEnabled = !soundEnabled;
    setSoundEnabled(newSoundEnabled);
    localStorage.setItem('notificationSoundEnabled', JSON.stringify(newSoundEnabled));
    
    // Inicializar áudio se necessário e tocar som de teste quando ativar
    if (newSoundEnabled) {
      if (!audioInitialized) {
        await initializeAudio();
      }
      
      setTimeout(() => {
        playNotificationSound('success');
      }, 200);
    }
  };

  // Alternar toast
  const toggleToast = () => {
    const newToastEnabled = !toastEnabled;
    setToastEnabled(newToastEnabled);
    localStorage.setItem('notificationToastEnabled', JSON.stringify(newToastEnabled));
    
    // Mostrar toast de teste quando ativar
    if (newToastEnabled) {
      const testNotification = {
        id: Date.now(),
        title: t('toastActivated'),
        message: t('toastActivatedMessage'),
        type: 'success',
        createdBy: 'Sistema',
        createdAt: new Date()
      };
      
      setLatestNotification(testNotification);
      setShowPushNotification(true);
      
      setTimeout(() => {
        setShowPushNotification(false);
      }, 3000);
    }
  };

  // Fechar notificação push
  const closePushNotification = () => {
    setShowPushNotification(false);
  };

  // Formatar data
  const formatDate = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return t('now');
    if (diffInMinutes < 60) return `${diffInMinutes}${t('minutesAgo')}`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}${t('hoursAgoShort')}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}${t('daysAgoShort')}`;
    
    return notificationDate.toLocaleDateString('pt-BR');
  };

  // Ícone por tipo de notificação
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22,4 12,14.01 9,11.01"></polyline>
          </svg>
        );
      case 'warning':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        );
      case 'error':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        );
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {showPushNotification && latestNotification && (
        <div 
          className="push-notification" 
          ref={pushNotificationRef}
        >
          <div 
            className={`push-notification-content ${latestNotification.type}`}
            onClick={() => {
              setIsOpen(true);
              setShowPushNotification(false);
            }}
          >
            <div className="push-notification-icon">
              {getNotificationIcon(latestNotification.type)}
            </div>
            <div className="push-notification-text">
              <div className="push-notification-title">
                {latestNotification.title}
              </div>
              <div className="push-notification-message">
                {latestNotification.message}
              </div>
              <div className="push-notification-time">
                {formatDate(latestNotification.createdAt)}
              </div>
            </div>
            <button 
              className="push-notification-close"
              onClick={(e) => {
                e.stopPropagation();
                closePushNotification();
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="notifications-container" ref={dropdownRef}>
        <button 
          className={`notifications-btn ${unreadCount > 0 ? 'has-notifications' : ''} ${!soundEnabled ? 'sound-disabled' : ''} ${!socketConnected ? 'disconnected' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          title={`Notificações${!soundEnabled ? ' (Som desabilitado)' : ''}${!socketConnected ? ' (Desconectado)' : ''}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          {!soundEnabled && (
            <span className="sound-disabled-indicator">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="23" y1="9" x2="17" y2="15"></line>
                <line x1="17" y1="9" x2="23" y2="15"></line>
              </svg>
            </span>
          )}
          
          {/* Indicador de conexão WebSocket */}
          <span className={`connection-indicator ${socketConnected ? 'connected' : 'disconnected'}`}>
            <span className="connection-dot"></span>
          </span>
          {unreadCount > 0 && (
            <span className="notification-badge">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="notifications-dropdown">
            <div className="notifications-header">
              <h3>{t('notifications')}</h3>
              <div className="notifications-header-actions">
                <button 
                  className="toast-toggle-btn"
                  onClick={toggleToast}
                  title={toastEnabled ? t('disableToast') : t('enableToast')}
                >
                  {toastEnabled ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                      <line x1="22" y1="2" x2="2" y2="22"></line>
                    </svg>
                  )}
                </button>
                <button 
                  className="sound-toggle-btn"
                  onClick={toggleSound}
                  title={soundEnabled ? t('disableSound') : t('enableSound')}
                >
                  {soundEnabled ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                      <line x1="23" y1="9" x2="17" y2="15"></line>
                      <line x1="17" y1="9" x2="23" y2="15"></line>
                    </svg>
                  )}
                </button>
                {unreadCount > 0 && (
                  <button 
                    className="mark-all-read-btn"
                    onClick={markAllAsRead}
                  >
                    {t('markAllAsRead')}
                  </button>
                )}
              </div>
            </div>

            <div className="notifications-list">
              {loading ? (
                <div className="notifications-loading">
                  <div className="loading-spinner"></div>
                  <span>{t('loadingNotifications')}</span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="no-notifications">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  <p>{t('noNotifications')}</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`notification-item ${!notification.isRead ? 'unread' : ''} ${notification.type}`}
                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                  >
                    <div className="notification-icon">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-content">
                      <div className="notification-title">
                        {notification.title}
                        {!notification.isRead && <span className="unread-dot"></span>}
                      </div>
                      <div className="notification-message">
                        {notification.message}
                      </div>
                      <div className="notification-meta">
                        <span className="notification-author">
                          {t('by')} {notification.createdBy}
                        </span>
                        <span className="notification-time">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="notifications-footer">
                <div className="footer-info">
                  <div className="status-indicators">
                    <span className="status-item">
                      {toastEnabled ? (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                          </svg>
                          {t('toast')}
                        </>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                            <line x1="22" y1="2" x2="2" y2="22"></line>
                          </svg>
                          {t('toast')}
                        </>
                      )}
                    </span>
                    <span className="status-item">
                      {soundEnabled ? (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                          </svg>
                          {t('sound')}
                        </>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                            <line x1="23" y1="9" x2="17" y2="15"></line>
                            <line x1="17" y1="9" x2="23" y2="15"></line>
                          </svg>
                          {t('sound')}
                        </>
                      )}
                    </span>
                    <span className={`status-item connection-status ${socketConnected ? 'connected' : 'disconnected'}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {socketConnected && <circle cx="12" cy="12" r="3"></circle>}
                      </svg>
                      {socketConnected ? 'Conectado' : 'Desconectado'}
                    </span>
                  </div>
                  <div className="test-buttons">
                    {soundEnabled && (
                      <button 
                        className="test-sound-btn"
                        onClick={() => playNotificationSound('info')}
                        title={t('testSound')}
                      >
                        🔊
                      </button>
                    )}
                    {toastEnabled && (
                      <button 
                        className="test-toast-btn"
                        onClick={() => {
                          const testNotification = {
                            id: Date.now(),
                            title: t('testToast'),
                            message: t('testToastMessage'),
                            type: 'info',
                            createdBy: 'Sistema',
                            createdAt: new Date()
                          };
                          
                          setLatestNotification(testNotification);
                          setShowPushNotification(true);
                          playNotificationSound('info');
                          
                          setTimeout(() => {
                            setShowPushNotification(false);
                          }, 6000);
                        }}
                        title={t('testToastButton')}
                      >
                        📱
                      </button>
                    )}
                  </div>
                </div>
                <button 
                  className="refresh-btn"
                  onClick={loadNotifications}
                  disabled={loading}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23,4 23,10 17,10"></polyline>
                    <polyline points="1,20 1,14 7,14"></polyline>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                  </svg>
                  {t('refresh')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Notifications;
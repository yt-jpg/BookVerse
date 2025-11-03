import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Modal from '../Modal/Modal';
import './UserProfile.css';

const UserProfile = () => {
  const { user, updateUser, refreshUser, deleteAccount } = useAuth();
  const { t } = useLanguage(); // eslint-disable-line no-unused-vars
  
  const [formData, setFormData] = useState({
    firstName: user.name?.split(' ')[0] || '',
    lastName: user.name?.split(' ').slice(1).join(' ') || '',
    email: user.email || '',
    phone: user.phone || '',
    newEmail: '',
    newPhone: ''
  });
  
  const [profileImage, setProfileImage] = useState(user.profileImage || null);
  const [coverImage, setCoverImage] = useState(user.coverImage || null);
  const [coverPosition, setCoverPosition] = useState(user.coverPosition || { x: 50, y: 50 }); // Posição em porcentagem
  const [isDragging, setIsDragging] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const profileImageRef = useRef(null);
  const coverImageRef = useRef(null);

  // Sincronizar dados
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || '',
        newEmail: '',
        newPhone: ''
      });
      setProfileImage(user.profileImage || null);
      setCoverImage(user.coverImage || null);
      setCoverPosition(user.coverPosition || { x: 50, y: 50 });
    }
  }, [user]);

  // Mostrar loading se não há usuário
  if (!user) {
    return (
      <div className="user-profile">
        <div className="profile-header">
          <h2>Carregando perfil...</h2>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setProfileImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverImage(e.target.result);
        setCoverPosition({ x: 50, y: 50 }); // Reset position when new image is loaded
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e) => {
    if (!coverImage) return;
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !coverImage) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setCoverPosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (!coverImage) return;
    setIsDragging(true);
    e.preventDefault();
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !coverImage) return;
    
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    
    setCoverPosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const updatedData = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        profileImage,
        coverImage,
        coverPosition
      };
      
      console.log('Salvando dados do perfil:', updatedData);
      
      await updateUser(updatedData);
      
      // Recarregar dados do usuário para garantir sincronização
      await refreshUser();
      
      setMessage('Perfil atualizado com sucesso!');
      
      // Limpar mensagem após 3 segundos
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      setMessage(error.message || 'Erro ao atualizar perfil. Tente novamente.');
      
      // Limpar mensagem de erro após 5 segundos
      setTimeout(() => setMessage(''), 5000);
    }
    
    setLoading(false);
  };

  const handleEmailChange = async () => {
    if (!formData.newEmail) return;
    
    setLoading(true);
    try {
      await updateUser({ email: formData.newEmail });
      setFormData({ ...formData, email: formData.newEmail, newEmail: '' });
      setShowEmailModal(false);
      setMessage('Email atualizado com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Erro ao atualizar email:', error);
      setMessage(error.message || 'Erro ao atualizar email. Tente novamente.');
      setTimeout(() => setMessage(''), 5000);
    }
    setLoading(false);
  };

  const handlePhoneChange = async () => {
    if (!formData.newPhone) return;
    
    setLoading(true);
    try {
      await updateUser({ phone: formData.newPhone });
      setFormData({ ...formData, phone: formData.newPhone, newPhone: '' });
      setShowPhoneModal(false);
      setMessage('Telefone atualizado com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Erro ao atualizar telefone:', error);
      setMessage(error.message || 'Erro ao atualizar telefone. Tente novamente.');
      setTimeout(() => setMessage(''), 5000);
    }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await deleteAccount();
      setMessage('Conta deletada com sucesso!');
    } catch (error) {
      setMessage('Erro ao deletar conta. Tente novamente.');
    }
    setLoading(false);
    setShowDeleteModal(false);
  };

  return (
    <div className="user-profile">
      <div className="profile-header">
        <h2>Meu Perfil</h2>
        <p>Gerencie suas informações pessoais e configurações de conta</p>
      </div>

      {message && (
        <div className={`profile-message ${message.includes('sucesso') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {/* Cover Image Section */}
      <div className="cover-section">
        <div 
          className={`cover-image ${isDragging ? 'dragging' : ''} ${coverImage ? 'has-image' : ''}`}
          style={{ 
            backgroundImage: coverImage ? `url(${coverImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundPosition: coverImage ? `${coverPosition.x}% ${coverPosition.y}%` : 'center'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <button 
            className="change-cover-btn"
            onClick={() => coverImageRef.current?.click()}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
            Alterar Capa
          </button>
          
          {coverImage && (
            <>
              <div className="cover-position-indicator">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 7l10 10M7 17L17 7"/>
                </svg>
                <span>
                  {isDragging 
                    ? `${Math.round(coverPosition.x)}%, ${Math.round(coverPosition.y)}%`
                    : 'Arraste para posicionar'
                  }
                </span>
              </div>
              
              <button 
                className="reset-position-btn"
                onClick={() => setCoverPosition({ x: 50, y: 50 })}
                title="Centralizar imagem"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                </svg>
              </button>
            </>
          )}
          
          <input
            ref={coverImageRef}
            type="file"
            accept="image/*"
            onChange={handleCoverImageChange}
            style={{ display: 'none' }}
          />
        </div>

        {/* Profile Image */}
        <div className="profile-image-container">
          <div 
            className="profile-image"
            style={{ 
              backgroundImage: profileImage ? `url(${profileImage})` : 'none'
            }}
          >
            {!profileImage && (
              <span className="profile-initial">
                {formData.firstName.charAt(0).toUpperCase()}
              </span>
            )}
            <button 
              className="change-profile-btn"
              onClick={() => profileImageRef.current?.click()}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
            </button>
          </div>
          <input
            ref={profileImageRef}
            type="file"
            accept="image/*"
            onChange={handleProfileImageChange}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* Profile Form */}
      <div className="profile-form">
        <div className="form-section">
          <h3>Informações Pessoais</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Nome</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Seu nome"
              />
            </div>
            
            <div className="form-group">
              <label>Sobrenome</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Seu sobrenome"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Informações de Contato</h3>
          
          <div className="contact-item">
            <div className="contact-info">
              <label>Email</label>
              <span className="current-value">{formData.email}</span>
            </div>
            <button 
              className="change-btn"
              onClick={() => setShowEmailModal(true)}
            >
              Alterar Email
            </button>
          </div>
          
          <div className="contact-item">
            <div className="contact-info">
              <label>Telefone</label>
              <span className="current-value">{formData.phone || 'Não informado'}</span>
            </div>
            <button 
              className="change-btn"
              onClick={() => setShowPhoneModal(true)}
            >
              {formData.phone ? 'Alterar Telefone' : 'Adicionar Telefone'}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="profile-actions">
          <button 
            className="save-btn"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Salvando...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17,21 17,13 7,13 7,21"></polyline>
                  <polyline points="7,3 7,8 15,8"></polyline>
                </svg>
                Salvar Alterações
              </>
            )}
          </button>
          
          <button 
            className="delete-btn"
            onClick={() => setShowDeleteModal(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3,6 5,6 21,6"></polyline>
              <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            Deletar Conta
          </button>
        </div>
      </div>

      {/* Modal Email */}
      <Modal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        title="Alterar Email"
        message="Digite seu novo endereço de email:"
      >
        <div className="modal-form">
          <input
            type="email"
            value={formData.newEmail}
            onChange={(e) => setFormData({ ...formData, newEmail: e.target.value })}
            placeholder="novo@email.com"
            className="modal-input"
          />
          <div className="modal-actions">
            <button 
              className="modal-btn cancel"
              onClick={() => setShowEmailModal(false)}
            >
              Cancelar
            </button>
            <button 
              className="modal-btn confirm"
              onClick={handleEmailChange}
              disabled={loading || !formData.newEmail}
            >
              Confirmar
            </button>
          </div>
        </div>
      </Modal>

      {/* Phone Change Modal */}
      <Modal
        isOpen={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        title={formData.phone ? "Alterar Telefone" : "Adicionar Telefone"}
        message="Digite seu número de telefone:"
      >
        <div className="modal-form">
          <input
            type="tel"
            value={formData.newPhone}
            onChange={(e) => setFormData({ ...formData, newPhone: e.target.value })}
            placeholder="(11) 99999-9999"
            className="modal-input"
          />
          <div className="modal-actions">
            <button 
              className="modal-btn cancel"
              onClick={() => setShowPhoneModal(false)}
            >
              Cancelar
            </button>
            <button 
              className="modal-btn confirm"
              onClick={handlePhoneChange}
              disabled={loading || !formData.newPhone}
            >
              Confirmar
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Deletar Conta"
        message="Tem certeza que deseja deletar sua conta? Esta ação não pode ser desfeita."
        type="warning"
        onConfirm={handleDeleteAccount}
        confirmText="Deletar Conta"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default UserProfile;
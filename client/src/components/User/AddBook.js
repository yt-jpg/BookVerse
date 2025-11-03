import { useState } from 'react';
import axios from 'axios';

const AddBook = () => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    category: ''
  });
  const [downloadLinks, setDownloadLinks] = useState([{ url: '', format: '' }]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const categories = [
    'Ficção', 'Romance', 'Mistério', 'Fantasia', 'Biografia', 
    'História', 'Ciência', 'Tecnologia', 'Autoajuda', 'Educação'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLinkChange = (index, field, value) => {
    const newLinks = [...downloadLinks];
    newLinks[index][field] = value;
    setDownloadLinks(newLinks);
  };

  const addLinkField = () => {
    setDownloadLinks([...downloadLinks, { url: '', format: '' }]);
  };

  const removeLinkField = (index) => {
    const newLinks = downloadLinks.filter((_, i) => i !== index);
    setDownloadLinks(newLinks);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('author', formData.author);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('category', formData.category);

    // Filtrar links vazios
    const validLinks = downloadLinks.filter(link => link.url.trim() !== '');
    if (validLinks.length > 0) {
      formDataToSend.append('downloadLinks', JSON.stringify(validLinks));
    }

    if (file) {
      formDataToSend.append('bookFile', file);
    }

    try {
      await axios.post('http://localhost:5000/api/books/add', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage('Livro adicionado com sucesso! Aguarde aprovação do administrador.');
      
      // Limpar formulário
      setFormData({
        title: '',
        author: '',
        description: '',
        category: ''
      });
      setDownloadLinks([{ url: '', format: '' }]);
      setFile(null);
      
    } catch (error) {
      setMessage('Erro ao adicionar livro. Tente novamente.');
      console.error('Erro:', error);
    }

    setLoading(false);
  };

  return (
    <div className="add-book modern-form">
      <div className="form-header">
        <div className="header-content">
          <h2>Compartilhar Conhecimento</h2>
          <p>Adicione um livro à nossa biblioteca e ajude outros a aprender</p>
        </div>
        <div className="header-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14,2 14,8 20,8"></polyline>
            <line x1="12" y1="11" x2="12" y2="17"></line>
            <line x1="9" y1="14" x2="15" y2="14"></line>
          </svg>
        </div>
      </div>
      
      {message && (
        <div className={`alert ${message.includes('sucesso') ? 'alert-success' : 'alert-error'}`}>
          <div className="alert-icon">
            {message.includes('sucesso') ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20,6 9,17 4,12"></polyline>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            )}
          </div>
          <div className="alert-content">
            <p>{message}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="add-book-form">
        <div className="form-section">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14,2 14,8 20,8"></polyline>
            </svg>
            Informações do Livro
          </h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14,2 14,8 20,8"></polyline>
                </svg>
                Título *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Digite o título do livro"
                required
              />
            </div>

            <div className="form-group">
              <label>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Autor *
              </label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                placeholder="Nome do autor"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
              Descrição
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descreva brevemente o conteúdo do livro..."
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
              Categoria
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">📚 Selecione uma categoria</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>📖 {cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-section">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
            Links de Download
          </h3>
          <p className="section-description">Adicione links externos para download do livro</p>
          
          <div className="links-container">
            {downloadLinks.map((link, index) => (
              <div key={index} className="link-group">
                <div className="link-inputs">
                  <input
                    type="url"
                    placeholder="https://exemplo.com/livro.pdf"
                    value={link.url}
                    onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="PDF, EPUB, MOBI..."
                    value={link.format}
                    onChange={(e) => handleLinkChange(index, 'format', e.target.value)}
                  />
                </div>
                {downloadLinks.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeLinkField(index)}
                    className="remove-btn"
                    title="Remover link"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                )}
              </div>
            ))}
            
            <button type="button" onClick={addLinkField} className="add-link-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Adicionar outro link
            </button>
          </div>
        </div>

        <div className="form-section">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14,2 14,8 20,8"></polyline>
            </svg>
            Upload de Arquivo
          </h3>
          <p className="section-description">Ou envie o arquivo diretamente do seu computador</p>
          
          <div className="file-upload-area">
            <input
              type="file"
              id="bookFile"
              onChange={(e) => setFile(e.target.files[0])}
              accept=".pdf,.epub,.mobi,.txt,.doc,.docx"
              className="file-input"
            />
            <label htmlFor="bookFile" className="file-upload-label">
              <div className="upload-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17,8 12,3 7,8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </div>
              <div className="upload-text">
                {file ? (
                  <>
                    <strong>{file.name}</strong>
                    <span>Clique para alterar o arquivo</span>
                  </>
                ) : (
                  <>
                    <strong>Clique para selecionar um arquivo</strong>
                    <span>PDF, EPUB, MOBI, TXT, DOC, DOCX</span>
                  </>
                )}
              </div>
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={() => {
              setFormData({ title: '', author: '', description: '', category: '' });
              setDownloadLinks([{ url: '', format: '' }]);
              setFile(null);
              setMessage('');
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Limpar
          </button>
          
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? (
              <>
                <div className="spinner"></div>
                Enviando...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22,4 12,14.01 9,11.01"></polyline>
                </svg>
                Compartilhar Livro
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBook;
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const BookSearch = () => {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = [
    'Ficção', 'Romance', 'Mistério', 'Fantasia', 'Biografia', 
    'História', 'Ciência', 'Tecnologia', 'Autoajuda', 'Educação'
  ];

  const searchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/books/search', {
        params: { query: searchQuery, category }
      });
      setBooks(response.data);
    } catch (error) {
      console.error('Erro ao buscar livros:', error);
    }
    setLoading(false);
  }, [searchQuery, category]);

  useEffect(() => {
    searchBooks();
  }, [searchBooks]);

  const handleDownload = async (bookId) => {
    try {
      await axios.post(`http://localhost:5000/api/books/download/${bookId}`);
      // Atualizar a lista para refletir o novo contador de downloads
      searchBooks();
    } catch (error) {
      console.error('Erro ao registrar download:', error);
    }
  };

  return (
    <div className="book-search modern-search">
      <div className="search-header">
        <h2>Explorar Biblioteca</h2>
        <p>Descubra livros incríveis compartilhados pela comunidade</p>
      </div>

      <div className="search-controls">
        <div className="search-input-group">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            placeholder="Buscar por título, autor ou palavra-chave..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            className="category-select"
          >
            <option value="">📚 Todas as categorias</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>📖 {cat}</option>
            ))}
          </select>
          
          <button onClick={searchBooks} className="search-btn" disabled={loading}>
            {loading ? (
              <>
                <div className="spinner"></div>
                Buscando...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                Buscar
              </>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Procurando os melhores livros para você...</p>
        </div>
      ) : (
        <>
          {books.length > 0 && (
            <div className="results-header">
              <h3>Encontrados {books.length} livro{books.length !== 1 ? 's' : ''}</h3>
            </div>
          )}
          
          <div className="books-grid">
            {books.map(book => (
              <div key={book._id} className="book-card modern-card">
                <div className="book-header">
                  <div className="book-icon">
                    📚
                  </div>
                  {book.category && (
                    <span className="category-badge">{book.category}</span>
                  )}
                </div>
                
                <div className="book-content">
                  <h3 className="book-title">{book.title}</h3>
                  <p className="book-author">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    {book.author}
                  </p>
                  
                  {book.description && (
                    <p className="book-description">{book.description}</p>
                  )}
                </div>
                
                <div className="book-actions">
                  {book.downloadLinks && book.downloadLinks.length > 0 && (
                    <div className="download-section">
                      <h4>Formatos Disponíveis:</h4>
                      <div className="download-links">
                        {book.downloadLinks.map((link, index) => (
                          <a 
                            key={index} 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={() => handleDownload(book._id)}
                            className="download-btn"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                              <polyline points="7,10 12,15 17,10"></polyline>
                              <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            {link.format || 'Download'}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {book.uploadedFile && (
                    <div className="download-section">
                      <h4>Arquivo:</h4>
                      <a 
                        href={`http://localhost:5000/uploads/${book.uploadedFile.filename}`}
                        download={book.uploadedFile.originalName}
                        onClick={() => handleDownload(book._id)}
                        className="download-btn primary"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7,10 12,15 17,10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Baixar Arquivo
                      </a>
                    </div>
                  )}
                </div>
                
                <div className="book-footer">
                  <div className="book-stats">
                    <span className="stat-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7,10 12,15 17,10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      {book.downloads} downloads
                    </span>
                    <span className="stat-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      {book.addedBy.name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && books.length === 0 && (
        <div className="no-results">
          <div className="no-results-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </div>
          <h3>Nenhum livro encontrado</h3>
          <p>Tente ajustar sua busca ou explorar diferentes categorias</p>
          <button onClick={() => {setSearchQuery(''); setCategory(''); searchBooks();}} className="reset-btn">
            Ver todos os livros
          </button>
        </div>
      )}
    </div>
  );
};

export default BookSearch;
import React, { useState } from 'react';
import { useLazyImage } from '../../hooks/usePerformance';
import './LazyImage.css';

const LazyImage = ({ 
  src, 
  alt, 
  placeholder = '/placeholder.jpg',
  className = '',
  ...props 
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useLazyImage(src);

  const handleLoad = () => {
    setLoaded(true);
  };

  const handleError = () => {
    setError(true);
  };

  return (
    <div className={`lazy-image-container ${className}`}>
      {!loaded && !error && (
        <div className="lazy-image-placeholder">
          <img 
            src={placeholder} 
            alt="Loading..." 
            className="placeholder-img"
          />
          <div className="loading-spinner"></div>
        </div>
      )}
      
      <img
        ref={imgRef}
        alt={alt}
        className={`lazy-image ${loaded ? 'loaded' : ''} ${error ? 'error' : ''}`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        decoding="async"
        {...props}
      />
      
      {error && (
        <div className="error-placeholder">
          <span>❌ Erro ao carregar imagem</span>
        </div>
      )}
    </div>
  );
};

export default LazyImage;
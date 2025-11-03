import jwt from 'jsonwebtoken';

const auth = function(req, res, next) {
  // Pegar token do header
  const token = req.header('x-auth-token');

  // Verificar se não tem token
  if (!token) {
    return res.status(401).json({ message: 'Sem token, autorização negada' });
  }

  try {
    // Verificar se é um token de desenvolvimento
    if (token.startsWith('dev_token_')) {
      // Token de desenvolvimento
      const userId = token.replace('dev_token_', '');
      req.user = { id: userId, role: 'user' };
      next();
    } else {
      // Token JWT normal
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      req.user = decoded.user;
      next();
    }
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
};

// Middleware para verificar se é admin
const adminAuth = function(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado. Apenas administradores.' });
  }
  next();
};

export default auth;
export { adminAuth };
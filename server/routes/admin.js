import express from 'express';
import { connect } from 'mongoose';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import Book from '../models/Book.js';
import User from '../models/User.js';
import auth, { adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Sistema de autenticação para configuração de banco
let tempPasswords = new Map(); // Armazenar senhas temporárias
let usedPasswords = new Set(); // Senhas já utilizadas

// Verificar se é o primeiro setup
router.get('/check-setup-status', async (req, res) => {
  try {
    // Verificar se existe arquivo de configuração
    const envPath = join(process.cwd(), '.env');
    let isFirstSetup = true;
    
    try {
      const envContent = readFileSync(envPath, 'utf8');
      if (envContent.includes('DB_CONFIGURED=true')) {
        isFirstSetup = false;
      }
    } catch (error) {
      // Arquivo .env não existe, é primeiro setup
      isFirstSetup = true;
    }
    
    res.json({ isFirstSetup });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Testar conexão no setup inicial (sem autenticação)
router.post('/initial-setup-test', async (req, res) => {
  try {
    const { connectionString } = req.body;
    
    if (!connectionString) {
      return res.status(400).json({ message: 'String de conexão é obrigatória' });
    }

    // Verificar se ainda é primeiro setup
    const envPath = join(process.cwd(), '.env');
    try {
      const envContent = readFileSync(envPath, 'utf8');
      if (envContent.includes('DB_CONFIGURED=true')) {
        return res.status(403).json({ message: 'Setup já foi concluído' });
      }
    } catch (error) {
      // Arquivo não existe, ok para continuar
    }

    // Importar função de teste
    const { testConnection } = await import('../config/database.js');
    const result = await testConnection(connectionString);
    
    if (result.success) {
      res.json({ 
        message: 'Conexão testada com sucesso!',
        type: result.type
      });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Concluir setup inicial
router.post('/complete-initial-setup', async (req, res) => {
  try {
    const { connectionString } = req.body;
    
    if (!connectionString) {
      return res.status(400).json({ message: 'String de conexão é obrigatória' });
    }

    // Verificar se ainda é primeiro setup
    const envPath = join(process.cwd(), '.env');
    try {
      const envContent = readFileSync(envPath, 'utf8');
      if (envContent.includes('DB_CONFIGURED=true')) {
        return res.status(403).json({ message: 'Setup já foi concluído' });
      }
    } catch (error) {
      // Arquivo não existe, ok para continuar
    }

    // Salvar configuração
    const envContent = `MONGODB_URI=${connectionString}
JWT_SECRET=seu_jwt_secret_aqui_mude_em_producao
PORT=5000
DB_CONFIGURED=true
SETUP_COMPLETED=true`;

    writeFileSync(envPath, envContent);
    
    res.json({ message: 'Setup inicial concluído com sucesso!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin supremo
const SUPREME_ADMIN = {
  username: 'admin_supremo',
  password: 'BookVerse2024!@#$%'
};

// Gerar senha temporária
router.post('/generate-temp-password', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Verificar credenciais
    if (username !== SUPREME_ADMIN.username || password !== SUPREME_ADMIN.password) {
      return res.status(401).json({ message: 'Credenciais de administrador inválidas' });
    }

    // Gerar código temporário
    const tempPassword = Math.random().toString(36).substring(2, 10).toUpperCase();
    const timestamp = Date.now();

    // Armazenar com timestamp
    tempPasswords.set(tempPassword, {
      created: timestamp,
      expires: timestamp + 10000, // 10 segundos
      used: false
    });

    // Limpar senhas expiradas
    for (const [key, value] of tempPasswords.entries()) {
      if (Date.now() > value.expires) {
        tempPasswords.delete(key);
      }
    }

    res.json({ tempPassword });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Autenticar para configuração de banco
router.post('/auth-database-config', async (req, res) => {
  try {
    const { username, password, tempCode } = req.body;

    // Verificar credenciais
    if (username !== SUPREME_ADMIN.username || password !== SUPREME_ADMIN.password) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Verificar código temporário
    const tempData = tempPasswords.get(tempCode);
    
    if (!tempData) {
      return res.status(401).json({ 
        message: 'Código temporário inválido ou expirado',
        resetTemp: true 
      });
    }

    if (Date.now() > tempData.expires) {
      tempPasswords.delete(tempCode);
      return res.status(401).json({ 
        message: 'Código temporário expirado',
        resetTemp: true 
      });
    }

    if (tempData.used || usedPasswords.has(tempCode)) {
      tempPasswords.delete(tempCode);
      return res.status(401).json({ 
        message: 'Código temporário já foi utilizado',
        resetTemp: true 
      });
    }

    // Marcar como usado
    tempData.used = true;
    usedPasswords.add(tempCode);
    tempPasswords.delete(tempCode);

    // Gerar token de sessão
    const sessionToken = 'db_config_' + Date.now() + '_' + Math.random().toString(36);

    res.json({ 
      message: 'Autenticado com sucesso',
      token: sessionToken
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Testar conexão de banco (com auth)
router.post('/test-db', async (req, res) => {
  try {
    const { connectionString, token } = req.body;
    
    // Verificar token de sessão
    if (!token || !token.startsWith('db_config_')) {
      return res.status(401).json({ message: 'Token de sessão inválido' });
    }

    if (!connectionString) {
      return res.status(400).json({ message: 'String de conexão é obrigatória' });
    }

    // Testar conexão MariaDB/MySQL
    if (connectionString.startsWith('mysql://')) {
      const { Sequelize } = await import('sequelize');
      
      try {
        const url = new URL(connectionString);
        const testSequelize = new Sequelize(url.pathname.slice(1), url.username, url.password, {
          host: url.hostname,
          port: url.port || 3306,
          dialect: 'mysql',
          logging: false,
          dialectOptions: {
            connectTimeout: 5000
          }
        });

        await testSequelize.authenticate();
        await testSequelize.close();
        
        res.json({ 
          message: 'Conexão testada com sucesso!',
          type: 'mariadb'
        });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    } else {
      // Importar função de teste para MongoDB
      const { testConnection } = await import('../config/database.js');
      const result = await testConnection(connectionString);
      
      if (result.success) {
        res.json({ 
          message: 'Conexão testada com sucesso!',
          type: result.type
        });
      } else {
        res.status(400).json({ error: result.error });
      }
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Salvar configuração de banco (com auth)
router.post('/save-db-config', async (req, res) => {
  try {
    const { connectionString, token } = req.body;
    
    // Verificar token de sessão
    if (!token || !token.startsWith('db_config_')) {
      return res.status(401).json({ message: 'Token de sessão inválido' });
    }

    if (!connectionString) {
      return res.status(400).json({ message: 'String de conexão é obrigatória' });
    }

    // Salvar no arquivo .env
    const envPath = join(process.cwd(), '.env');
    const envContent = `MONGODB_URI=${connectionString}
JWT_SECRET=seu_jwt_secret_aqui_mude_em_producao
PORT=5000
DB_CONFIGURED=true`;

    writeFileSync(envPath, envContent);
    
    res.json({ message: 'Configuração salva com sucesso!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Aplicar middleware de autenticação e admin nas outras rotas
router.use(auth);
router.use(adminAuth);

// Dashboard do admin - estatísticas
router.get('/dashboard', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalBooks = await Book.countDocuments();
    const pendingBooks = await Book.countDocuments({ status: 'pending' });
    const totalDownloads = await Book.aggregate([
      { $group: { _id: null, total: { $sum: '$downloads' } } }
    ]);

    res.json({
      totalUsers,
      totalBooks,
      pendingBooks,
      totalDownloads: totalDownloads[0]?.total || 0
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erro do servidor');
  }
});

// Listar todos os livros (incluindo pendentes)
router.get('/books', async (req, res) => {
  try {
    const books = await Book.find()
      .populate('addedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(books);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erro do servidor');
  }
});

// Aprovar/rejeitar livro
router.put('/books/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status inválido' });
    }

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ message: 'Livro não encontrado' });
    }

    res.json({ message: `Livro ${status === 'approved' ? 'aprovado' : 'rejeitado'}`, book });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erro do servidor');
  }
});

// Listar usuários
router.get('/users', async (req, res) => {
  try {
    if (req.mongoConnected) {
      // Modo MongoDB
      const users = await User.find({ role: 'user' })
        .select('-password')
        .sort({ createdAt: -1 });

      res.json(users);
    } else {
      // Modo memória
      const users = req.memoryDB.users.filter(u => u.role !== 'admin');
      res.json(users);
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erro do servidor');
  }
});

// Limpar todas as contas de usuário (manter apenas admin)
router.delete('/users/clear-all', async (req, res) => {
  try {
    if (req.mongoConnected) {
      // Modo MongoDB
      const result = await User.deleteMany({ role: 'user' });
      res.json({ 
        message: `${result.deletedCount} contas de usuário foram deletadas`,
        deletedCount: result.deletedCount
      });
    } else {
      // Modo memória
      const initialCount = req.memoryDB.users.length;
      req.memoryDB.users = req.memoryDB.users.filter(u => u.role === 'admin');
      const deletedCount = initialCount - req.memoryDB.users.length;
      
      res.json({ 
        message: `${deletedCount} contas de usuário foram deletadas`,
        deletedCount: deletedCount,
        remainingUsers: req.memoryDB.users.length
      });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erro do servidor');
  }
});

// Deletar livro
router.delete('/books/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Livro não encontrado' });
    }

    res.json({ message: 'Livro deletado com sucesso' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erro do servidor');
  }
});

export default router;
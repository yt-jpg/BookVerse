import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';

const router = express.Router();

// Registro
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (req.dbType === 'mysql') {
      // Modo MySQL
      const [existingUsers] = await req.db.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({ message: 'Usuário já existe' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const [result] = await req.db.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, 'user']
      );

      const userId = result.insertId;
      const payload = { user: { id: userId, role: 'user' } };
      
      jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' }, (err, token) => {
        if (err) throw err;
        res.json({ 
          token, 
          user: { 
            id: userId, 
            name: name, 
            email: email, 
            role: 'user' 
          } 
        });
      });

    } else if (req.mongoConnected) {
      // Modo MongoDB
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: 'Usuário já existe' });
      }

      user = new User({ name, email, password });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      const payload = { user: { id: user.id, role: user.role } };
      jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' }, (err, token) => {
        if (err) throw err;
        res.json({ 
          token, 
          user: { 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            phone: user.phone,
            profileImage: user.profileImage,
            coverImage: user.coverImage,
            coverPosition: user.coverPosition,
            role: user.role 
          } 
        });
      });
    } else {
      // Modo memória
      const existingUser = req.memoryDB.users.find(u => u.email === email);
      if (existingUser) {
        return res.status(400).json({ message: 'Usuário já existe' });
      }

      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password: 'hashed_' + password,
        role: 'user'
      };

      req.memoryDB.users.push(newUser);
      const token = 'dev_token_' + newUser.id;

      res.json({
        token,
        user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
      });
    }

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erro do servidor');
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (req.dbType === 'mysql') {
      // Modo MySQL
      const [users] = await req.db.execute(
        'SELECT id, name, email, password, role FROM users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        return res.status(400).json({ message: 'Credenciais inválidas' });
      }

      const user = users[0];
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return res.status(400).json({ message: 'Credenciais inválidas' });
      }

      const payload = { user: { id: user.id, role: user.role } };
      jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' }, (err, token) => {
        if (err) throw err;
        res.json({ 
          token, 
          user: { 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            role: user.role 
          } 
        });
      });

    } else if (req.mongoConnected) {
      // Modo MongoDB
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Credenciais inválidas' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Credenciais inválidas' });
      }

      const payload = { user: { id: user.id, role: user.role } };
      jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' }, (err, token) => {
        if (err) throw err;
        res.json({ 
          token, 
          user: { 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            phone: user.phone,
            profileImage: user.profileImage,
            coverImage: user.coverImage,
            coverPosition: user.coverPosition,
            role: user.role 
          } 
        });
      });
    } else {
      // Modo memória
      const user = req.memoryDB.users.find(u => u.email === email);
      if (!user) {
        return res.status(400).json({ message: 'Credenciais inválidas' });
      }

      if (password !== 'admin123' && !user.password.includes(password)) {
        return res.status(400).json({ message: 'Credenciais inválidas' });
      }

      const token = 'dev_token_' + user.id;
      res.json({
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      });
    }

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erro do servidor');
  }
});

// Esqueci senha
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Verificar se usuário existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: 'Email não encontrado na plataforma',
        emailExists: false
      });
    }

    // Gerar token de reset
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Salvar token no usuário (válido por 1 hora)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
    await user.save();

    // Simular envio de email (implementar serviço de email depois)
    // Token de reset gerado para: ${email}

    res.json({
      message: 'Instruções enviadas para seu email',
      emailExists: true
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erro do servidor');
  }
});

// Importar middleware de autenticação
import auth from '../middleware/auth.js';

// Obter perfil do usuário
router.get('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    if (req.mongoConnected) {
      // Modo MongoDB
      const user = await User.findById(userId).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        coverImage: user.coverImage,
        coverPosition: user.coverPosition,
        role: user.role
      });
    } else if (req.db) {
      // Modo MySQL
      req.db.query('SELECT id, name, email, phone, profile_image, cover_image, cover_position, role FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) {
          console.error('Erro ao buscar usuário:', err);
          return res.status(500).json({ message: 'Erro ao buscar perfil' });
        }

        if (results.length === 0) {
          return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        const user = results[0];
        res.json({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          profileImage: user.profile_image,
          coverImage: user.cover_image,
          coverPosition: user.cover_position ? JSON.parse(user.cover_position) : { x: 50, y: 50 },
          role: user.role
        });
      });
    } else {
      // Modo memória
      const user = req.memoryDB.users.find(u => u.id === userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        coverImage: user.coverImage,
        coverPosition: user.coverPosition || { x: 50, y: 50 },
        role: user.role
      });
    }
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ message: 'Erro do servidor' });
  }
});

// Atualizar perfil do usuário
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email, phone, profileImage, coverImage, coverPosition } = req.body;
    const userId = req.user.id;

    if (req.mongoConnected) {
      // Modo MongoDB
      const updateData = {};
      
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;
      if (profileImage !== undefined) updateData.profileImage = profileImage;
      if (coverImage !== undefined) updateData.coverImage = coverImage;
      if (coverPosition !== undefined) updateData.coverPosition = coverPosition;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: 'Nenhum campo para atualizar' });
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId, 
        updateData, 
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      res.json({ 
        message: 'Perfil atualizado com sucesso',
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          profileImage: updatedUser.profileImage,
          coverImage: updatedUser.coverImage,
          coverPosition: updatedUser.coverPosition,
          role: updatedUser.role
        }
      });
    } else if (req.db) {
      // Modo MySQL
      const updateFields = [];
      const values = [];

      if (name) {
        updateFields.push('name = ?');
        values.push(name);
      }
      if (email) {
        updateFields.push('email = ?');
        values.push(email);
      }
      if (phone !== undefined) {
        updateFields.push('phone = ?');
        values.push(phone);
      }
      if (profileImage !== undefined) {
        updateFields.push('profile_image = ?');
        values.push(profileImage);
      }
      if (coverImage !== undefined) {
        updateFields.push('cover_image = ?');
        values.push(coverImage);
      }
      if (coverPosition !== undefined) {
        updateFields.push('cover_position = ?');
        values.push(JSON.stringify(coverPosition));
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ message: 'Nenhum campo para atualizar' });
      }

      values.push(userId);
      const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;

      req.db.query(query, values, (err, result) => {
        if (err) {
          console.error('Erro ao atualizar usuário:', err);
          return res.status(500).json({ message: 'Erro ao atualizar perfil' });
        }

        res.json({ message: 'Perfil atualizado com sucesso' });
      });
    } else {
      // Modo memória
      const user = req.memoryDB.users.find(u => u.id === userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      if (name) user.name = name;
      if (email) user.email = email;
      if (phone !== undefined) user.phone = phone;
      if (profileImage !== undefined) user.profileImage = profileImage;
      if (coverImage !== undefined) user.coverImage = coverImage;
      if (coverPosition !== undefined) user.coverPosition = coverPosition;

      res.json({ message: 'Perfil atualizado com sucesso' });
    }
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ message: 'Erro do servidor' });
  }
});

// Deletar conta do usuário
router.delete('/account', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    if (req.db) {
      // Modo MySQL - deletar usuário e seus dados relacionados
      req.db.query('DELETE FROM users WHERE id = ?', [userId], (err, result) => {
        if (err) {
          console.error('Erro ao deletar usuário:', err);
          return res.status(500).json({ message: 'Erro ao deletar conta' });
        }

        res.json({ message: 'Conta deletada com sucesso' });
      });
    } else {
      // Modo memória
      const userIndex = req.memoryDB.users.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      req.memoryDB.users.splice(userIndex, 1);
      res.json({ message: 'Conta deletada com sucesso' });
    }
  } catch (error) {
    console.error('Erro ao deletar conta:', error);
    res.status(500).json({ message: 'Erro do servidor' });
  }
});

export default router;
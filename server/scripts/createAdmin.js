import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { config } from 'dotenv';

config();

const createAdmin = async () => {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bookverse');
    console.log('Conectado ao MongoDB');

    // Verificar se já existe um admin
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Já existe um administrador no sistema:', existingAdmin.email);
      process.exit(0);
    }

    // Criar usuário administrador
    const adminData = {
      name: 'Administrador',
      email: 'admin@bookplatform.com',
      password: 'admin123',
      role: 'admin'
    };

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    adminData.password = await bcrypt.hash(adminData.password, salt);

    // Salvar no banco
    const admin = new User(adminData);
    await admin.save();

    console.log('Administrador criado com sucesso!');
    console.log('Email: admin@bookplatform.com');
    console.log('Senha: admin123');
    console.log('IMPORTANTE: Altere a senha após o primeiro login!');

  } catch (error) {
    console.error('Erro ao criar administrador:', error);
  } finally {
    mongoose.connection.close();
  }
};

createAdmin();
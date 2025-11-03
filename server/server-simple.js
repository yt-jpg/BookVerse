import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { Sequelize } from 'sequelize';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware básico
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos do cliente
app.use(express.static(path.join(__dirname, '../client/build')));

// Função para conectar ao banco de dados
async function connectDatabase() {
    const dbType = process.env.DB_TYPE || 'mysql';
    
    if (dbType === 'mongodb') {
        try {
            const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bookverse';
            await mongoose.connect(mongoUri);
            console.log('✅ MongoDB conectado');
            return { success: true, type: 'mongodb' };
        } catch (error) {
            console.log('❌ Erro MongoDB:', error.message);
            return { success: false, error: error.message };
        }
    } else {
        try {
            const sequelize = new Sequelize(
                process.env.DB_NAME || 'bookverse',
                process.env.DB_USER || 'root',
                process.env.DB_PASSWORD || '',
                {
                    host: process.env.DB_HOST || 'localhost',
                    port: process.env.DB_PORT || 3306,
                    dialect: 'mysql',
                    logging: false
                }
            );
            
            await sequelize.authenticate();
            console.log('✅ MySQL conectado');
            return { success: true, type: 'mysql' };
        } catch (error) {
            console.log('❌ Erro MySQL:', error.message);
            return { success: false, error: error.message };
        }
    }
}

// Rotas básicas
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'BookVerse API funcionando',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/books', (req, res) => {
    res.json({ 
        books: [],
        message: 'Lista de livros (implementar com banco de dados)'
    });
});

// Rota catch-all para React
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Iniciar servidor
async function startServer() {
    console.log('🚀 Iniciando BookVerse...');
    
    // Tentar conectar ao banco
    const dbResult = await connectDatabase();
    if (!dbResult.success) {
        console.log('⚠️ Continuando sem banco de dados');
        console.log('💡 Para usar banco de dados:');
        console.log('   MySQL: Instale XAMPP ou MySQL');
        console.log('   MongoDB: sudo apt install mongodb');
    }
    
    // Iniciar servidor
    app.listen(PORT, () => {
        console.log(`✅ Servidor rodando na porta ${PORT}`);
        console.log(`🌐 Acesse: http://localhost:${PORT}`);
        
        if (dbResult.success) {
            console.log(`📊 Banco: ${dbResult.type} conectado`);
        }
    });
}

startServer().catch(console.error);
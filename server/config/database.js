import { connect as mongoConnect } from 'mongoose';
import { Sequelize } from 'sequelize';

let mongoConnected = false;
let sqlConnected = false;
let sequelize = null;

// Configuração MongoDB
const connectMongoDB = async (uri) => {
  try {
    await mongoConnect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    mongoConnected = true;
    console.log('✅ MongoDB conectado');
    return { success: true, type: 'mongodb' };
  } catch (error) {
    console.log('❌ MongoDB falhou:', error.message);
    return { success: false, error: error.message };
  }
};

// Configuração MariaDB/MySQL
const connectMariaDB = async (config) => {
  try {
    const { host, port, database, username, password } = config;
    
    sequelize = new Sequelize(database, username, password, {
      host: host,
      port: port || 3306,
      dialect: 'mysql',
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });

    await sequelize.authenticate();
    sqlConnected = true;
    console.log('✅ MariaDB conectado');
    return { success: true, type: 'mariadb' };
  } catch (error) {
    console.log('❌ MariaDB falhou:', error.message);
    return { success: false, error: error.message };
  }
};

// Função universal de conexão
const connectDatabase = async (connectionString) => {
  if (connectionString.startsWith('mongodb')) {
    return await connectMongoDB(connectionString);
  } else if (connectionString.startsWith('mysql://') || connectionString.includes('mariadb')) {
    // Parse da string de conexão MySQL
    const url = new URL(connectionString);
    const config = {
      host: url.hostname,
      port: url.port || 3306,
      database: url.pathname.slice(1),
      username: url.username,
      password: url.password
    };
    return await connectMariaDB(config);
  } else {
    // Tentar como configuração direta
    try {
      const config = JSON.parse(connectionString);
      return await connectMariaDB(config);
    } catch {
      return { success: false, error: 'Formato de conexão inválido' };
    }
  }
};

// Testar conexão
const testConnection = async (connectionString) => {
  console.log('🔍 Testando conexão:', connectionString.replace(/\/\/.*@/, '//***:***@'));
  
  if (connectionString.startsWith('mongodb')) {
    try {
      const testConn = await mongoConnect(connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
      });
      await testConn.connection.close();
      console.log('✅ MongoDB: Teste bem-sucedido');
      return { success: true, type: 'mongodb' };
    } catch (error) {
      console.log('❌ MongoDB: Erro -', error.message);
      return { success: false, error: error.message };
    }
  } else {
    try {
      let config;
      if (connectionString.startsWith('mysql://')) {
        const url = new URL(connectionString);
        config = {
          host: url.hostname,
          port: url.port || 3306,
          database: url.pathname.slice(1),
          username: url.username,
          password: url.password
        };
      } else {
        config = JSON.parse(connectionString);
      }

      console.log('🔧 Configuração MariaDB:', {
        host: config.host,
        port: config.port,
        database: config.database,
        username: config.username,
        password: '***'
      });

      const testSequelize = new Sequelize(config.database, config.username, config.password, {
        host: config.host,
        port: config.port || 3306,
        dialect: 'mysql',
        logging: console.log, // Ativar logs para debug
        dialectOptions: {
          connectTimeout: 10000,
          acquireTimeout: 10000,
          timeout: 10000,
        }
      });

      console.log('🔌 Tentando autenticar...');
      await testSequelize.authenticate();
      console.log('✅ MariaDB: Autenticação bem-sucedida');
      
      await testSequelize.close();
      console.log('✅ MariaDB: Conexão fechada com sucesso');
      
      return { success: true, type: 'mariadb' };
    } catch (error) {
      console.log('❌ MariaDB: Erro -', error.message);
      console.log('❌ Detalhes do erro:', error);
      return { success: false, error: error.message };
    }
  }
};

export {
  connectDatabase,
  testConnection,
  mongoConnected,
  sqlConnected,
  sequelize
};
// Configuração inicial do MongoDB

// Switch to bookverse database
db = db.getSiblingDB('bookverse');

// Coleções e índices
db.createCollection('users');
db.createCollection('books');
db.createCollection('downloads');
db.createCollection('notifications');

// Índices usuários
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "createdAt": 1 });

// Índices livros
db.books.createIndex({ "title": "text", "author": "text", "description": "text" });
db.books.createIndex({ "category": 1 });
db.books.createIndex({ "status": 1 });
db.books.createIndex({ "uploadedBy": 1 });
db.books.createIndex({ "createdAt": -1 });

// Índices downloads
db.downloads.createIndex({ "bookId": 1 });
db.downloads.createIndex({ "userId": 1 });
db.downloads.createIndex({ "downloadedAt": -1 });

// Índices notificações
db.notifications.createIndex({ "userId": 1 });
db.notifications.createIndex({ "read": 1 });
db.notifications.createIndex({ "createdAt": -1 });

// Índices compostos
db.books.createIndex({ "status": 1, "createdAt": -1 });
db.downloads.createIndex({ "userId": 1, "downloadedAt": -1 });

print('✅ BookVerse database initialized with collections and indexes');

// Admin padrão (opcional)
/*
db.users.insertOne({
    name: "Admin",
    email: "admin@bookverse.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
    role: "admin",
    createdAt: new Date()
});
print('✅ Default admin user created');
*/
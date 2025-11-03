#!/usr/bin/env node

// 🧪 Teste rápido do servidor BookVerse

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testando servidor BookVerse...\n');

// Verificar se arquivos existem
const serverPath = path.join(__dirname, 'server', 'server-simple.js');
const packagePath = path.join(__dirname, 'package.json');
const envPath = path.join(__dirname, '.env');

console.log('📁 Verificando arquivos:');
console.log(`   server-simple.js: ${require('fs').existsSync(serverPath) ? '✅' : '❌'}`);
console.log(`   package.json: ${require('fs').existsSync(packagePath) ? '✅' : '❌'}`);
console.log(`   .env: ${require('fs').existsSync(envPath) ? '✅' : '❌'}`);

console.log('\n🚀 Iniciando servidor de teste...');

// Iniciar servidor
const server = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true
});

// Aguardar alguns segundos e testar
setTimeout(() => {
    console.log('\n🔍 Testando conexão...');
    
    import('http').then(http => {
        const req = http.get('http://localhost:5000/api/health', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log('✅ Servidor respondendo!');
                console.log('📊 Resposta:', data);
                process.exit(0);
            });
        });
        
        req.on('error', (err) => {
            console.log('❌ Erro na conexão:', err.message);
            console.log('💡 Verifique se o servidor iniciou corretamente');
            process.exit(1);
        });
        
        req.setTimeout(5000, () => {
            console.log('⏰ Timeout - servidor pode estar iniciando ainda');
            process.exit(1);
        });
    });
}, 3000);

// Capturar Ctrl+C
process.on('SIGINT', () => {
    console.log('\n⏹️ Parando teste...');
    server.kill();
    process.exit(0);
});
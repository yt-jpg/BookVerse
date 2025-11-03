#!/usr/bin/env node

// 🔍 Diagnóstico do BookVerse

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Diagnóstico do BookVerse\n');

// Verificar Node.js
console.log('📋 Versões:');
console.log(`   Node.js: ${process.version}`);
console.log(`   npm: ${process.env.npm_version || 'N/A'}`);

// Verificar arquivos essenciais
console.log('\n📁 Arquivos essenciais:');
const files = [
    'package.json',
    '.env',
    'server/server-simple.js',
    'client/package.json',
    'client/src/App.js'
];

files.forEach(file => {
    const exists = fs.existsSync(path.join(__dirname, file));
    console.log(`   ${file}: ${exists ? '✅' : '❌'}`);
});

// Verificar dependências
console.log('\n📦 Dependências:');
try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const deps = Object.keys(pkg.dependencies || {});
    console.log(`   Servidor: ${deps.length} dependências`);
    
    const clientPkg = JSON.parse(fs.readFileSync('client/package.json', 'utf8'));
    const clientDeps = Object.keys(clientPkg.dependencies || {});
    console.log(`   Cliente: ${clientDeps.length} dependências`);
} catch (error) {
    console.log('   ❌ Erro ao ler package.json');
}

// Verificar .env
console.log('\n⚙️ Configuração (.env):');
try {
    const envContent = fs.readFileSync('.env', 'utf8');
    const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    
    lines.forEach(line => {
        const [key] = line.split('=');
        console.log(`   ${key}: ✅`);
    });
} catch (error) {
    console.log('   ❌ Erro ao ler .env');
}

// Verificar node_modules
console.log('\n📚 Instalações:');
const nodeModules = fs.existsSync('node_modules');
const clientNodeModules = fs.existsSync('client/node_modules');

console.log(`   node_modules: ${nodeModules ? '✅' : '❌'}`);
console.log(`   client/node_modules: ${clientNodeModules ? '✅' : '❌'}`);

if (!nodeModules || !clientNodeModules) {
    console.log('\n💡 Execute: npm install && cd client && npm install');
}

// Verificar portas
console.log('\n🌐 Configuração de rede:');
console.log(`   Porta configurada: ${process.env.PORT || '5000'}`);

console.log('\n🎯 Status geral:');
const allGood = nodeModules && clientNodeModules && fs.existsSync('.env');
console.log(`   ${allGood ? '✅ Pronto para executar' : '⚠️ Precisa de configuração'}`);

if (allGood) {
    console.log('\n🚀 Para iniciar:');
    console.log('   npm run dev');
} else {
    console.log('\n🔧 Para corrigir:');
    if (!nodeModules) console.log('   1. npm install');
    if (!clientNodeModules) console.log('   2. cd client && npm install');
    if (!fs.existsSync('.env')) console.log('   3. cp .env.example .env');
}
#!/usr/bin/env node

/**
 * 🔍 BookVerse - Diagnóstico Inteligente do Sistema
 * Detecta automaticamente a plataforma e verifica configurações
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cores para output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
    console.log('\n' + '='.repeat(60));
    log(`🔍 ${message}`, 'cyan');
    console.log('='.repeat(60));
}

function checkCommand(command) {
    try {
        execSync(`${command} --version`, { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

function checkFile(filePath) {
    return fs.existsSync(filePath);
}

function getFileSize(filePath) {
    try {
        const stats = fs.statSync(filePath);
        return (stats.size / 1024).toFixed(2) + ' KB';
    } catch {
        return 'N/A';
    }
}

function detectPlatform() {
    const platform = os.platform();
    const arch = os.arch();
    const release = os.release();
    
    let platformName = 'Unknown';
    let version = 'Unknown';
    let packageManager = null;
    
    switch (platform) {
        case 'win32':
            platformName = 'Windows';
            try {
                const ver = execSync('ver', { encoding: 'utf8' });
                if (ver.includes('10.0')) version = '10/11';
                else if (ver.includes('6.3')) version = '8.1';
                else if (ver.includes('6.1')) version = '7';
            } catch {}
            packageManager = 'winget';
            break;
            
        case 'linux':
            platformName = 'Linux';
            packageManager = 'apt';
            try {
                if (fs.existsSync('/etc/os-release')) {
                    const osRelease = fs.readFileSync('/etc/os-release', 'utf8');
                    const nameMatch = osRelease.match(/NAME="([^"]+)"/);
                    const versionMatch = osRelease.match(/VERSION="([^"]+)"/);
                    if (nameMatch) platformName = nameMatch[1];
                    if (versionMatch) version = versionMatch[1];
                    
                    if (osRelease.includes('centos') || osRelease.includes('rhel')) {
                        packageManager = 'yum';
                    }
                }
            } catch {}
            break;
            
        case 'darwin':
            platformName = 'macOS';
            packageManager = 'brew';
            try {
                version = execSync('sw_vers -productVersion', { encoding: 'utf8' }).trim();
            } catch {}
            break;
    }
    
    return {
        platform,
        platformName,
        version,
        arch,
        packageManager,
        isAdmin: platform === 'win32' ? checkWindowsAdmin() : process.getuid && process.getuid() === 0
    };
}

function checkWindowsAdmin() {
    try {
        execSync('net session', { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

function checkPort(port) {
    try {
        const command = os.platform() === 'win32' 
            ? `netstat -an | findstr :${port}`
            : `lsof -i :${port}`;
        
        execSync(command, { stdio: 'ignore' });
        return true; // Porta em uso
    } catch {
        return false; // Porta livre
    }
}

async function main() {
    console.clear();
    log(`
████████╗ ██████╗  ██████╗ ██╗  ██╗██╗   ██╗███████╗██████╗ ███████╗███████╗
██╔══██║██╔═══██╗██╔═══██╗██║ ██╔╝██║   ██║██╔════╝██╔══██╗██╔════╝██╔════╝
██████╔╝██║   ██║██║   ██║█████╔╝ ██║   ██║█████╗  ██████╔╝███████╗█████╗  
██╔══██╗██║   ██║██║   ██║██╔═██╗ ╚██╗ ██╔╝██╔══╝  ██╔══██╗╚════██║██╔══╝  
██████╔╝╚██████╔╝╚██████╔╝██║  ██╗ ╚████╔╝ ███████╗██║  ██║███████║███████╗
╚═════╝  ╚═════╝  ╚═════╝ ╚═╝  ╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝
    `, 'magenta');

    logHeader('Diagnóstico Inteligente do Sistema');

    // Detectar plataforma
    const platformInfo = detectPlatform();
    
    log(`🖥️  Sistema: ${platformInfo.platformName} ${platformInfo.version}`, 'blue');
    log(`🏗️  Arquitetura: ${platformInfo.arch}`, 'blue');
    log(`📦 Gerenciador: ${platformInfo.packageManager}`, 'blue');
    log(`👤 Privilégios: ${platformInfo.isAdmin ? 'Administrador' : 'Usuário normal'}`, 'blue');
    log(`💾 CPUs: ${os.cpus().length} cores`, 'blue');
    log(`🧠 Memória: ${(os.freemem() / 1024 / 1024 / 1024).toFixed(1)}GB livre de ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(1)}GB`, 'blue');
    log(`🟢 Node.js: ${process.version}`, 'blue');

    // Verificar dependências do sistema
    logHeader('Dependências do Sistema');
    
    const systemDeps = [
        { name: 'Node.js', command: 'node', required: true },
        { name: 'npm', command: 'npm', required: true },
        { name: 'Git', command: 'git', required: true },
        { name: 'Python3', command: 'python3', required: false }
    ];

    let systemOk = true;
    for (const dep of systemDeps) {
        if (checkCommand(dep.command)) {
            try {
                const version = execSync(`${dep.command} --version`, { encoding: 'utf8' }).trim();
                log(`✅ ${dep.name}: ${version.split('\n')[0]}`, 'green');
            } catch {
                log(`✅ ${dep.name}: Instalado`, 'green');
            }
        } else {
            if (dep.required) {
                log(`❌ ${dep.name}: Não encontrado (obrigatório)`, 'red');
                systemOk = false;
            } else {
                log(`⚠️  ${dep.name}: Não encontrado (opcional)`, 'yellow');
            }
        }
    }

    // Verificar arquivos do projeto
    logHeader('Estrutura do Projeto');
    
    const projectFiles = [
        { path: 'package.json', required: true, desc: 'Configuração do servidor' },
        { path: '.env', required: true, desc: 'Variáveis de ambiente' },
        { path: '.env.example', required: false, desc: 'Exemplo de configuração' },
        { path: 'server/server.js', required: true, desc: 'Servidor principal' },
        { path: 'server/server-simple.js', required: false, desc: 'Servidor simplificado' },
        { path: 'client/package.json', required: true, desc: 'Configuração do cliente' },
        { path: 'client/src/App.js', required: true, desc: 'Aplicação React' },
        { path: 'setup.js', required: false, desc: 'Setup inteligente' }
    ];

    let projectOk = true;
    for (const file of projectFiles) {
        if (checkFile(file.path)) {
            const size = getFileSize(file.path);
            log(`✅ ${file.path} (${size}) - ${file.desc}`, 'green');
        } else {
            if (file.required) {
                log(`❌ ${file.path} - ${file.desc} (obrigatório)`, 'red');
                projectOk = false;
            } else {
                log(`⚠️  ${file.path} - ${file.desc} (opcional)`, 'yellow');
            }
        }
    }

    // Verificar dependências instaladas
    logHeader('Dependências Instaladas');
    
    const serverModules = checkFile('node_modules');
    const clientModules = checkFile('client/node_modules');
    
    if (serverModules) {
        try {
            const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            const deps = Object.keys(pkg.dependencies || {});
            log(`✅ Servidor: ${deps.length} dependências instaladas`, 'green');
        } catch {
            log(`✅ node_modules do servidor existe`, 'green');
        }
    } else {
        log(`❌ node_modules do servidor não encontrado`, 'red');
        log(`   💡 Execute: npm install`, 'yellow');
        projectOk = false;
    }

    if (clientModules) {
        try {
            const clientPkg = JSON.parse(fs.readFileSync('client/package.json', 'utf8'));
            const clientDeps = Object.keys(clientPkg.dependencies || {});
            log(`✅ Cliente: ${clientDeps.length} dependências instaladas`, 'green');
        } catch {
            log(`✅ node_modules do cliente existe`, 'green');
        }
    } else {
        log(`❌ node_modules do cliente não encontrado`, 'red');
        log(`   💡 Execute: cd client && npm install`, 'yellow');
        projectOk = false;
    }

    // Verificar configuração
    logHeader('Configuração do Ambiente');
    
    if (checkFile('.env')) {
        try {
            const envContent = fs.readFileSync('.env', 'utf8');
            const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
            log(`✅ Arquivo .env com ${lines.length} configurações`, 'green');
            
            // Verificar configurações importantes
            const importantConfigs = [
                { key: 'JWT_SECRET', desc: 'Chave JWT' },
                { key: 'PORT', desc: 'Porta do servidor' },
                { key: 'NODE_ENV', desc: 'Ambiente' },
                { key: 'DB_TYPE', desc: 'Tipo de banco' }
            ];
            
            for (const config of importantConfigs) {
                if (envContent.includes(config.key)) {
                    const match = envContent.match(new RegExp(`${config.key}=(.+)`));
                    const value = match ? match[1].trim() : 'definido';
                    log(`  ✅ ${config.key}: ${value} - ${config.desc}`, 'green');
                } else {
                    log(`  ⚠️  ${config.key}: não encontrado - ${config.desc}`, 'yellow');
                }
            }
        } catch (error) {
            log('❌ Erro ao ler .env', 'red');
            projectOk = false;
        }
    } else {
        log('❌ Arquivo .env não encontrado', 'red');
        log('   💡 Execute: cp .env.example .env', 'yellow');
        projectOk = false;
    }

    // Verificar portas
    logHeader('Verificação de Rede');
    
    const ports = [
        { port: 3000, desc: 'Cliente React' },
        { port: 5000, desc: 'Servidor API' }
    ];
    
    for (const { port, desc } of ports) {
        const inUse = checkPort(port);
        if (inUse) {
            log(`⚠️  Porta ${port} em uso - ${desc}`, 'yellow');
        } else {
            log(`✅ Porta ${port} disponível - ${desc}`, 'green');
        }
    }

    // Verificar banco de dados
    logHeader('Banco de Dados');
    
    if (checkFile('.env')) {
        const envContent = fs.readFileSync('.env', 'utf8');
        
        if (envContent.includes('DB_TYPE=mysql')) {
            const hasMySQL = checkCommand('mysql') || checkCommand('mysqld');
            log(`${hasMySQL ? '✅' : '❌'} MySQL: ${hasMySQL ? 'Instalado' : 'Não encontrado'}`, hasMySQL ? 'green' : 'red');
        } else if (envContent.includes('DB_TYPE=mongodb')) {
            const hasMongo = checkCommand('mongod') || checkCommand('mongo');
            log(`${hasMongo ? '✅' : '❌'} MongoDB: ${hasMongo ? 'Instalado' : 'Não encontrado'}`, hasMongo ? 'green' : 'red');
        } else if (envContent.includes('DB_TYPE=sqlite')) {
            log(`✅ SQLite: Configurado (arquivo local)`, 'green');
        } else {
            log(`ℹ️  Nenhum banco configurado`, 'blue');
        }
    }

    // Verificar scripts personalizados
    logHeader('Scripts de Plataforma');
    
    const scripts = platformInfo.platform === 'win32' 
        ? ['start-bookverse.bat', 'stop-bookverse.bat', 'update-bookverse.bat']
        : ['start-bookverse.sh', 'stop-bookverse.sh', 'update-bookverse.sh'];
    
    for (const script of scripts) {
        const exists = checkFile(script);
        log(`${exists ? '✅' : '⚠️ '} ${script}: ${exists ? 'Disponível' : 'Não encontrado'}`, exists ? 'green' : 'yellow');
    }

    // Resumo final e recomendações
    logHeader('Resumo e Recomendações');
    
    const overallStatus = systemOk && projectOk;
    
    if (overallStatus) {
        log('🎉 Sistema totalmente configurado e pronto!', 'green');
        log('', 'reset');
        log('🚀 Para iniciar o projeto:', 'cyan');
        if (platformInfo.platform === 'win32') {
            log('   • Execute: start-bookverse.bat', 'yellow');
            log('   • Ou: npm run dev', 'yellow');
        } else {
            log('   • Execute: ./start-bookverse.sh', 'yellow');
            log('   • Ou: npm run dev', 'yellow');
        }
        log('', 'reset');
        log('🌐 Acesso:', 'cyan');
        log('   • Frontend: http://localhost:3000', 'yellow');
        log('   • Backend: http://localhost:5000', 'yellow');
    } else {
        log('⚠️  Configuração incompleta - problemas encontrados', 'yellow');
        log('', 'reset');
        log('🔧 Para corrigir:', 'cyan');
        
        if (!systemOk) {
            log('   1. Instale as dependências do sistema:', 'yellow');
            if (platformInfo.platform === 'win32') {
                log('      • Execute como Administrador: node setup.js', 'yellow');
            } else {
                log('      • Execute: node setup.js', 'yellow');
            }
        }
        
        if (!projectOk) {
            if (!serverModules) log('   2. npm install', 'yellow');
            if (!clientModules) log('   3. cd client && npm install', 'yellow');
            if (!checkFile('.env')) log('   4. cp .env.example .env', 'yellow');
        }
        
        log('', 'reset');
        log('💡 Ou execute o setup automático:', 'cyan');
        log('   node setup.js', 'yellow');
    }

    // Informações específicas da plataforma
    log('', 'reset');
    log('📋 Informações da Plataforma:', 'cyan');
    log(`   • SO: ${platformInfo.platformName} ${platformInfo.version}`, 'blue');
    log(`   • Arquitetura: ${platformInfo.arch}`, 'blue');
    log(`   • Gerenciador: ${platformInfo.packageManager}`, 'blue');
    
    if (platformInfo.platform === 'win32' && !platformInfo.isAdmin) {
        log('   ⚠️  Para instalar dependências, execute como Administrador', 'yellow');
    }

    console.log('\n');
}

main().catch(console.error);
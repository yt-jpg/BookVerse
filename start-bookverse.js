#!/usr/bin/env node

/**
 * 🚀 BookVerse - Inicializador Simples
 * Executa diagnóstico e inicia todos os serviços principais
 */

import { execSync, spawn } from 'child_process';
import os from 'os';

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
    const timestamp = new Date().toLocaleTimeString();
    console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

function logHeader(message) {
    console.log('\n' + '='.repeat(60));
    log(`🚀 ${message}`, 'cyan');
    console.log('='.repeat(60));
}

async function showWelcome() {
    console.clear();
    console.log(`${colors.magenta}
████████╗ ██████╗  ██████╗ ██╗  ██╗██╗   ██╗███████╗██████╗ ███████╗███████╗
██╔══██║██╔═══██╗██╔═══██╗██║ ██╔╝██║   ██║██╔════╝██╔══██╗██╔════╝██╔════╝
██████╔╝██║   ██║██║   ██║█████╔╝ ██║   ██║█████╗  ██████╔╝███████╗█████╗  
██╔══██╗██║   ██║██║   ██║██╔═██╗ ╚██╗ ██╔╝██╔══╝  ██╔══██╗╚════██║██╔══╝  
██████╔╝╚██████╔╝╚██████╔╝██║  ██╗ ╚████╔╝ ███████╗██║  ██║███████║███████╗
╚═════╝  ╚═════╝  ╚═════╝ ╚═╝  ╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝
    ${colors.reset}`);
    
    logHeader('Inicializador Completo do BookVerse');
    log('Sistema de biblioteca digital com detecção automática', 'cyan');
}

async function runDiagnostic() {
    logHeader('Diagnóstico Pré-Inicialização');
    
    try {
        log('Executando diagnóstico do sistema...', 'blue');
        execSync('node diagnose.js', { stdio: 'inherit' });
        log('✅ Diagnóstico concluído!', 'green');
    } catch (error) {
        log('⚠️ Diagnóstico com avisos, mas continuando...', 'yellow');
    }
    
    console.log('\n');
}

async function startAllServices() {
    logHeader('Iniciando Todos os Serviços');
    
    log('🚀 Iniciando servidor, cliente e instalador web...', 'cyan');
    log('📊 Logs serão exibidos com prefixos coloridos', 'blue');
    
    console.log('\n🌐 URLs que estarão disponíveis:');
    console.log(`   📚 BookVerse: ${colors.blue}http://localhost:5000${colors.reset}`);
    console.log(`   🎨 Cliente: ${colors.magenta}http://localhost:3000${colors.reset}`);
    console.log(`   🛠️ Instalador: ${colors.green}http://localhost:8080${colors.reset}`);
    console.log('\n⏹️  Pressione Ctrl+C para parar todos os serviços\n');
    
    // Usar concurrently para iniciar todos os serviços
    const concurrentlyCmd = os.platform() === 'win32' 
        ? 'npx concurrently'
        : 'npx concurrently';
    
    const args = [
        '--kill-others-on-fail',
        '--prefix-colors', 'bgBlue.bold,bgMagenta.bold,bgGreen.bold',
        '--names', '🚀SERVER,🎨CLIENT,🛠️INSTALLER',
        'npm run server',
        'npm run client', 
        'npm run web-installer'
    ];
    
    const process = spawn('npx', ['concurrently', ...args.slice(1)], {
        stdio: 'inherit',
        shell: true
    });
    
    process.on('close', (code) => {
        if (code !== 0) {
            log(`❌ Serviços pararam com código ${code}`, 'red');
        } else {
            log('✅ Todos os serviços finalizados', 'green');
        }
        process.exit(code);
    });
    
    process.on('error', (error) => {
        log(`❌ Erro ao iniciar serviços: ${error.message}`, 'red');
        process.exit(1);
    });
    
    // Graceful shutdown
    process.on('SIGINT', () => {
        log('\n🛑 Parando todos os serviços...', 'yellow');
        process.kill();
    });
}

async function main() {
    try {
        await showWelcome();
        await runDiagnostic();
        await startAllServices();
    } catch (error) {
        log(`❌ Erro: ${error.message}`, 'red');
        process.exit(1);
    }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { main };
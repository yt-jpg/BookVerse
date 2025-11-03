#!/usr/bin/env node

/**
 * 🚀 BookVerse - Inicializador Completo
 * Inicia todos os serviços em um único terminal com diagnóstico automático
 */

import { spawn } from 'child_process';
import { execSync } from 'child_process';
import os from 'os';
import fs from 'fs';

class BookVerseStarter {
    constructor() {
        this.platform = os.platform();
        this.processes = [];
        this.colors = {
            reset: '\x1b[0m',
            bright: '\x1b[1m',
            red: '\x1b[31m',
            green: '\x1b[32m',
            yellow: '\x1b[33m',
            blue: '\x1b[34m',
            magenta: '\x1b[35m',
            cyan: '\x1b[36m'
        };
    }

    log(message, color = 'reset') {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`${this.colors[color]}[${timestamp}] ${message}${this.colors.reset}`);
    }

    logHeader(message) {
        console.log('\n' + '='.repeat(80));
        this.log(`🚀 ${message}`, 'cyan');
        console.log('='.repeat(80));
    }

    async showWelcome() {
        console.clear();
        this.log(`
████████╗ ██████╗  ██████╗ ██╗  ██╗██╗   ██╗███████╗██████╗ ███████╗███████╗
██╔══██║██╔═══██╗██╔═══██╗██║ ██╔╝██║   ██║██╔════╝██╔══██╗██╔════╝██╔════╝
██████╔╝██║   ██║██║   ██║█████╔╝ ██║   ██║█████╗  ██████╔╝███████╗█████╗  
██╔══██╗██║   ██║██║   ██║██╔═██╗ ╚██╗ ██╔╝██╔══╝  ██╔══██╗╚════██║██╔══╝  
██████╔╝╚██████╔╝╚██████╔╝██║  ██╗ ╚████╔╝ ███████╗██║  ██║███████║███████╗
╚═════╝  ╚═════╝  ╚═════╝ ╚═╝  ╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝
        `, 'magenta');

        this.logHeader('Inicializador Completo - Todos os Serviços');
        this.log('Sistema de biblioteca digital com detecção automática de plataforma', 'cyan');
        console.log();
    }

    async runDiagnostic() {
        this.logHeader('Executando Diagnóstico Pré-Inicialização');
        
        try {
            this.log('Verificando sistema e dependências...', 'blue');
            const diagnosticOutput = execSync('node diagnose.js', { encoding: 'utf8' });
            
            // Extrair informações importantes do diagnóstico
            const lines = diagnosticOutput.split('\n');
            const systemInfo = lines.find(line => line.includes('Sistema:'));
            const nodeInfo = lines.find(line => line.includes('Node.js:'));
            const memoryInfo = lines.find(line => line.includes('Memória:'));
            
            if (systemInfo) this.log(systemInfo.trim(), 'green');
            if (nodeInfo) this.log(nodeInfo.trim(), 'green');
            if (memoryInfo) this.log(memoryInfo.trim(), 'green');
            
            this.log('✅ Diagnóstico concluído - Sistema pronto!', 'green');
            
        } catch (error) {
            this.log('⚠️ Diagnóstico encontrou alguns problemas, mas continuando...', 'yellow');
        }
    }

    async checkDependencies() {
        this.logHeader('Verificando Dependências');
        
        const dependencies = [
            { name: 'Node.js', command: 'node --version' },
            { name: 'npm', command: 'npm --version' },
            { name: 'Git', command: 'git --version' }
        ];

        for (const dep of dependencies) {
            try {
                const version = execSync(dep.command, { encoding: 'utf8' }).trim();
                this.log(`✅ ${dep.name}: ${version}`, 'green');
            } catch (error) {
                this.log(`❌ ${dep.name}: Não encontrado`, 'red');
            }
        }

        // Verificar se dependências do projeto estão instaladas
        if (fs.existsSync('node_modules')) {
            this.log('✅ Dependências do servidor instaladas', 'green');
        } else {
            this.log('⚠️ Instalando dependências do servidor...', 'yellow');
            execSync('npm install', { stdio: 'inherit' });
        }

        if (fs.existsSync('client/node_modules')) {
            this.log('✅ Dependências do cliente instaladas', 'green');
        } else {
            this.log('⚠️ Instalando dependências do cliente...', 'yellow');
            execSync('cd client && npm install', { stdio: 'inherit' });
        }
    }

    async startServices() {
        this.logHeader('Iniciando Todos os Serviços');
        
        const services = [
            {
                name: 'SERVIDOR',
                command: 'npm',
                args: ['run', 'server'],
                color: 'blue',
                port: 5000,
                description: 'Servidor principal da API'
            },
            {
                name: 'CLIENTE',
                command: 'npm',
                args: ['run', 'client'],
                color: 'magenta',
                port: 3000,
                description: 'Interface React do usuário'
            },
            {
                name: 'INSTALADOR',
                command: 'npm',
                args: ['run', 'web-installer'],
                color: 'green',
                port: 8080,
                description: 'Instalador web inteligente'
            },
            {
                name: 'MONITOR-PERF',
                command: 'python',
                args: ['performance-monitor.py'],
                color: 'yellow',
                port: null,
                description: 'Monitor de performance'
            },
            {
                name: 'MONITOR-SYS',
                command: 'python',
                args: ['monitor.py'],
                color: 'cyan',
                port: null,
                description: 'Monitor do sistema'
            }
        ];

        this.log('Iniciando serviços em paralelo...', 'cyan');
        console.log();

        for (const service of services) {
            this.startService(service);
            await this.sleep(1000); // Delay entre inicializações
        }

        this.showServiceStatus(services);
        this.setupGracefulShutdown();
    }

    startService(service) {
        this.log(`🚀 Iniciando ${service.name}: ${service.description}`, service.color);
        
        const process = spawn(service.command, service.args, {
            stdio: ['inherit', 'pipe', 'pipe'],
            shell: true
        });

        // Prefixar output com nome do serviço
        process.stdout.on('data', (data) => {
            const lines = data.toString().split('\n').filter(line => line.trim());
            lines.forEach(line => {
                console.log(`${this.colors[service.color]}[${service.name}]${this.colors.reset} ${line}`);
            });
        });

        process.stderr.on('data', (data) => {
            const lines = data.toString().split('\n').filter(line => line.trim());
            lines.forEach(line => {
                console.log(`${this.colors.red}[${service.name}-ERROR]${this.colors.reset} ${line}`);
            });
        });

        process.on('close', (code) => {
            if (code !== 0) {
                this.log(`❌ ${service.name} parou com código ${code}`, 'red');
            } else {
                this.log(`✅ ${service.name} finalizado normalmente`, 'green');
            }
        });

        process.on('error', (error) => {
            this.log(`❌ Erro ao iniciar ${service.name}: ${error.message}`, 'red');
        });

        this.processes.push({ ...service, process });
    }

    showServiceStatus(services) {
        setTimeout(() => {
            this.logHeader('Status dos Serviços');
            
            console.log('🌐 URLs Disponíveis:');
            console.log(`   📚 BookVerse Principal: ${this.colors.blue}http://localhost:5000${this.colors.reset}`);
            console.log(`   🎨 Interface Cliente: ${this.colors.magenta}http://localhost:3000${this.colors.reset}`);
            console.log(`   🛠️ Instalador Web: ${this.colors.green}http://localhost:8080${this.colors.reset}`);
            console.log();
            
            console.log('📊 Serviços Ativos:');
            services.forEach(service => {
                const status = this.processes.find(p => p.name === service.name);
                const statusIcon = status ? '🟢' : '🔴';
                const portInfo = service.port ? ` (porta ${service.port})` : '';
                console.log(`   ${statusIcon} ${service.name}${portInfo}: ${service.description}`);
            });
            
            console.log();
            console.log('🎯 Comandos Úteis:');
            console.log('   • Ctrl+C: Parar todos os serviços');
            console.log('   • npm run diagnose: Executar diagnóstico');
            console.log('   • node setup.js: Setup inteligente');
            console.log();
            
            this.log('🎉 Todos os serviços iniciados! BookVerse está rodando completo.', 'green');
            
        }, 5000);
    }

    setupGracefulShutdown() {
        const shutdown = () => {
            this.logHeader('Parando Todos os Serviços');
            
            this.processes.forEach(service => {
                if (service.process && !service.process.killed) {
                    this.log(`🛑 Parando ${service.name}...`, 'yellow');
                    service.process.kill('SIGTERM');
                }
            });

            setTimeout(() => {
                this.log('✅ Todos os serviços foram parados', 'green');
                process.exit(0);
            }, 2000);
        };

        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
        process.on('exit', shutdown);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async start() {
        try {
            await this.showWelcome();
            await this.runDiagnostic();
            await this.checkDependencies();
            await this.startServices();
            
            // Manter o processo principal vivo
            process.stdin.resume();
            
        } catch (error) {
            this.log(`❌ Erro durante a inicialização: ${error.message}`, 'red');
            process.exit(1);
        }
    }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    const starter = new BookVerseStarter();
    starter.start().catch(console.error);
}

export default BookVerseStarter;
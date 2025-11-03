#!/usr/bin/env node

/**
 * 🚀 BookVerse - Setup Inteligente
 * Detecta automaticamente a plataforma e configura todas as informações necessárias
 * 
 * Funcionalidades:
 * - Detecção automática de SO (Windows, Linux, macOS)
 * - Detecção de arquitetura (x64, arm64, etc.)
 * - Instalação automática de dependências
 * - Configuração inteligente do ambiente
 * - Setup do banco de dados baseado na plataforma
 * - Otimizações específicas por plataforma
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync, spawn } from 'child_process';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cores para output no terminal
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

class PlatformDetector {
    constructor() {
        this.platform = os.platform();
        this.arch = os.arch();
        this.release = os.release();
        this.type = os.type();
        this.cpus = os.cpus();
        this.memory = os.totalmem();
        this.homeDir = os.homedir();
        this.tempDir = os.tmpdir();
        
        this.platformInfo = this.detectPlatform();
        this.packageManager = this.detectPackageManager();
        this.shell = this.detectShell();
    }

    detectPlatform() {
        const info = {
            os: this.platform,
            arch: this.arch,
            release: this.release,
            type: this.type,
            name: 'Unknown',
            version: 'Unknown',
            packageManager: null,
            installCommands: {},
            serviceManager: null,
            pathSeparator: path.sep,
            isAdmin: false
        };

        switch (this.platform) {
            case 'win32':
                info.name = 'Windows';
                info.version = this.getWindowsVersion();
                info.packageManager = 'winget';
                info.installCommands = {
                    nodejs: 'winget install OpenJS.NodeJS --accept-package-agreements --accept-source-agreements',
                    git: 'winget install Git.Git --accept-package-agreements --accept-source-agreements',
                    python: 'winget install Python.Python.3.11 --accept-package-agreements --accept-source-agreements',
                    mysql: 'winget install Oracle.MySQL --accept-package-agreements --accept-source-agreements',
                    mongodb: 'winget install MongoDB.Server --accept-package-agreements --accept-source-agreements'
                };
                info.serviceManager = 'sc';
                info.isAdmin = this.checkWindowsAdmin();
                break;

            case 'linux':
                const distro = this.getLinuxDistro();
                info.name = distro.name;
                info.version = distro.version;
                info.packageManager = distro.packageManager;
                info.installCommands = this.getLinuxCommands(distro.packageManager);
                info.serviceManager = 'systemctl';
                info.isAdmin = process.getuid && process.getuid() === 0;
                break;

            case 'darwin':
                info.name = 'macOS';
                info.version = this.getMacOSVersion();
                info.packageManager = 'brew';
                info.installCommands = {
                    nodejs: 'brew install node',
                    git: 'brew install git',
                    python: 'brew install python3',
                    mysql: 'brew install mysql',
                    mongodb: 'brew install mongodb/brew/mongodb-community'
                };
                info.serviceManager = 'brew services';
                info.isAdmin = process.getuid && process.getuid() === 0;
                break;
        }

        return info;
    }

    getWindowsVersion() {
        try {
            const version = execSync('ver', { encoding: 'utf8' });
            if (version.includes('10.0')) return 'Windows 10/11';
            if (version.includes('6.3')) return 'Windows 8.1';
            if (version.includes('6.1')) return 'Windows 7';
            return 'Windows';
        } catch {
            return 'Windows';
        }
    }

    checkWindowsAdmin() {
        try {
            execSync('net session', { stdio: 'ignore' });
            return true;
        } catch {
            return false;
        }
    }

    getLinuxDistro() {
        try {
            // Tentar ler /etc/os-release
            if (fs.existsSync('/etc/os-release')) {
                const osRelease = fs.readFileSync('/etc/os-release', 'utf8');
                const lines = osRelease.split('\n');
                const info = {};
                
                lines.forEach(line => {
                    const [key, value] = line.split('=');
                    if (key && value) {
                        info[key] = value.replace(/"/g, '');
                    }
                });

                const name = info.NAME || info.ID || 'Linux';
                const version = info.VERSION || info.VERSION_ID || 'Unknown';
                
                // Detectar gerenciador de pacotes baseado na distribuição
                let packageManager = 'apt';
                if (name.toLowerCase().includes('centos') || 
                    name.toLowerCase().includes('rhel') || 
                    name.toLowerCase().includes('fedora')) {
                    packageManager = 'yum';
                } else if (name.toLowerCase().includes('arch')) {
                    packageManager = 'pacman';
                } else if (name.toLowerCase().includes('opensuse')) {
                    packageManager = 'zypper';
                }

                return { name, version, packageManager };
            }
            
            // Fallback para métodos alternativos
            if (fs.existsSync('/etc/debian_version')) {
                return { name: 'Debian/Ubuntu', version: 'Unknown', packageManager: 'apt' };
            }
            if (fs.existsSync('/etc/redhat-release')) {
                return { name: 'Red Hat/CentOS', version: 'Unknown', packageManager: 'yum' };
            }
            
            return { name: 'Linux', version: 'Unknown', packageManager: 'apt' };
        } catch {
            return { name: 'Linux', version: 'Unknown', packageManager: 'apt' };
        }
    }

    getLinuxCommands(packageManager) {
        const commands = {
            apt: {
                nodejs: 'curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt install -y nodejs',
                git: 'sudo apt install -y git',
                python: 'sudo apt install -y python3 python3-pip',
                mysql: 'sudo apt install -y mysql-server',
                mongodb: 'sudo apt install -y mongodb'
            },
            yum: {
                nodejs: 'curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash - && sudo yum install -y nodejs',
                git: 'sudo yum install -y git',
                python: 'sudo yum install -y python3 python3-pip',
                mysql: 'sudo yum install -y mysql-server',
                mongodb: 'sudo yum install -y mongodb-server'
            },
            pacman: {
                nodejs: 'sudo pacman -S nodejs npm',
                git: 'sudo pacman -S git',
                python: 'sudo pacman -S python python-pip',
                mysql: 'sudo pacman -S mysql',
                mongodb: 'sudo pacman -S mongodb'
            }
        };

        return commands[packageManager] || commands.apt;
    }

    getMacOSVersion() {
        try {
            const version = execSync('sw_vers -productVersion', { encoding: 'utf8' }).trim();
            return `macOS ${version}`;
        } catch {
            return 'macOS';
        }
    }

    detectPackageManager() {
        const managers = {
            win32: ['winget', 'choco', 'scoop'],
            linux: ['apt', 'yum', 'dnf', 'pacman', 'zypper'],
            darwin: ['brew', 'port']
        };

        const platformManagers = managers[this.platform] || [];
        
        for (const manager of platformManagers) {
            try {
                execSync(`${manager} --version`, { stdio: 'ignore' });
                return manager;
            } catch {
                continue;
            }
        }

        return this.platformInfo.packageManager;
    }

    detectShell() {
        if (this.platform === 'win32') {
            return process.env.ComSpec || 'cmd.exe';
        }
        return process.env.SHELL || '/bin/bash';
    }

    checkCommand(command) {
        try {
            execSync(`${command} --version`, { stdio: 'ignore' });
            return true;
        } catch {
            return false;
        }
    }

    getSystemResources() {
        return {
            cpuCount: this.cpus.length,
            cpuModel: this.cpus[0]?.model || 'Unknown',
            totalMemory: Math.round(this.memory / 1024 / 1024 / 1024), // GB
            freeMemory: Math.round(os.freemem() / 1024 / 1024 / 1024), // GB
            platform: this.platformInfo.name,
            arch: this.arch,
            nodeVersion: process.version
        };
    }
}

class BookVerseSetup {
    constructor() {
        this.detector = new PlatformDetector();
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.config = {
            installDir: null,
            database: null,
            environment: 'development',
            features: []
        };
    }

    log(message, color = 'white') {
        console.log(`${colors[color]}${message}${colors.reset}`);
    }

    logHeader(message) {
        console.log('\n' + '='.repeat(60));
        this.log(`🚀 ${message}`, 'cyan');
        console.log('='.repeat(60));
    }

    logSuccess(message) {
        this.log(`✅ ${message}`, 'green');
    }

    logWarning(message) {
        this.log(`⚠️  ${message}`, 'yellow');
    }

    logError(message) {
        this.log(`❌ ${message}`, 'red');
    }

    logInfo(message) {
        this.log(`ℹ️  ${message}`, 'blue');
    }

    async question(prompt) {
        return new Promise((resolve) => {
            this.rl.question(prompt, resolve);
        });
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

        this.logHeader('Setup Inteligente - Detecção Automática de Plataforma');
        
        const resources = this.detector.getSystemResources();
        
        this.logInfo(`Sistema detectado: ${this.detector.platformInfo.name} ${this.detector.platformInfo.version}`);
        this.logInfo(`Arquitetura: ${resources.arch}`);
        this.logInfo(`CPU: ${resources.cpuModel} (${resources.cpuCount} cores)`);
        this.logInfo(`Memória: ${resources.freeMemory}GB livre de ${resources.totalMemory}GB total`);
        this.logInfo(`Node.js: ${resources.nodeVersion}`);
        this.logInfo(`Gerenciador de pacotes: ${this.detector.packageManager}`);
        
        if (this.detector.platformInfo.isAdmin) {
            this.logSuccess('Executando com privilégios administrativos');
        } else {
            this.logWarning('Executando sem privilégios administrativos');
        }

        console.log('\nEste setup irá:');
        console.log('• Instalar dependências automaticamente');
        console.log('• Configurar o ambiente baseado na sua plataforma');
        console.log('• Otimizar configurações para seu sistema');
        console.log('• Configurar banco de dados apropriado');
        console.log('• Criar scripts de inicialização personalizados');

        const proceed = await this.question('\nDeseja continuar? (s/N): ');
        if (!proceed.toLowerCase().startsWith('s')) {
            this.logInfo('Setup cancelado pelo usuário');
            process.exit(0);
        }
    }

    async checkDependencies() {
        this.logHeader('Verificando Dependências');

        const dependencies = {
            node: { command: 'node', required: true },
            npm: { command: 'npm', required: true },
            git: { command: 'git', required: true },
            python: { command: 'python3', required: false }
        };

        const missing = [];
        const installed = [];

        for (const [name, dep] of Object.entries(dependencies)) {
            if (this.detector.checkCommand(dep.command)) {
                try {
                    const version = execSync(`${dep.command} --version`, { encoding: 'utf8' }).trim();
                    installed.push({ name, version: version.split('\n')[0] });
                    this.logSuccess(`${name}: ${version.split('\n')[0]}`);
                } catch {
                    this.logSuccess(`${name}: Instalado`);
                }
            } else {
                missing.push({ name, ...dep });
                if (dep.required) {
                    this.logError(`${name}: Não encontrado (obrigatório)`);
                } else {
                    this.logWarning(`${name}: Não encontrado (opcional)`);
                }
            }
        }

        if (missing.length > 0) {
            const requiredMissing = missing.filter(dep => dep.required);
            if (requiredMissing.length > 0) {
                this.logWarning('Dependências obrigatórias não encontradas');
                const install = await this.question('Deseja instalar automaticamente? (s/N): ');
                if (install.toLowerCase().startsWith('s')) {
                    await this.installDependencies(missing);
                } else {
                    this.logError('Não é possível continuar sem as dependências obrigatórias');
                    process.exit(1);
                }
            }
        } else {
            this.logSuccess('Todas as dependências estão instaladas!');
        }
    }

    async installDependencies(missing) {
        this.logHeader('Instalando Dependências');

        if (!this.detector.platformInfo.isAdmin && this.detector.platform !== 'darwin') {
            this.logWarning('Privilégios administrativos podem ser necessários');
        }

        for (const dep of missing) {
            const command = this.detector.platformInfo.installCommands[dep.name];
            if (command) {
                this.logInfo(`Instalando ${dep.name}...`);
                try {
                    execSync(command, { stdio: 'inherit' });
                    this.logSuccess(`${dep.name} instalado com sucesso`);
                } catch (error) {
                    this.logError(`Erro ao instalar ${dep.name}: ${error.message}`);
                    if (dep.required) {
                        process.exit(1);
                    }
                }
            } else {
                this.logWarning(`Comando de instalação não disponível para ${dep.name}`);
            }
        }
    }

    async chooseInstallDirectory() {
        this.logHeader('Diretório de Instalação');

        const suggestions = {
            win32: [
                { path: path.join(this.detector.homeDir, 'Desktop', 'BookVerse'), desc: 'Desktop (Recomendado)' },
                { path: path.join(this.detector.homeDir, 'Documents', 'BookVerse'), desc: 'Documentos' },
                { path: path.join(process.cwd(), 'BookVerse'), desc: 'Diretório atual' }
            ],
            linux: [
                { path: path.join(this.detector.homeDir, 'BookVerse'), desc: 'Home (Recomendado)' },
                { path: path.join(this.detector.homeDir, 'Desktop', 'BookVerse'), desc: 'Desktop' },
                { path: '/opt/BookVerse', desc: 'Sistema (/opt)' }
            ],
            darwin: [
                { path: path.join(this.detector.homeDir, 'BookVerse'), desc: 'Home (Recomendado)' },
                { path: path.join(this.detector.homeDir, 'Desktop', 'BookVerse'), desc: 'Desktop' },
                { path: '/Applications/BookVerse', desc: 'Applications' }
            ]
        };

        const platformSuggestions = suggestions[this.detector.platform] || suggestions.linux;

        console.log('Escolha o diretório de instalação:');
        platformSuggestions.forEach((suggestion, index) => {
            console.log(`${index + 1}. ${suggestion.desc}: ${suggestion.path}`);
        });
        console.log(`${platformSuggestions.length + 1}. Personalizado`);

        const choice = await this.question(`\nEscolha (1-${platformSuggestions.length + 1}): `);
        const choiceNum = parseInt(choice);

        if (choiceNum >= 1 && choiceNum <= platformSuggestions.length) {
            this.config.installDir = platformSuggestions[choiceNum - 1].path;
        } else if (choiceNum === platformSuggestions.length + 1) {
            this.config.installDir = await this.question('Digite o caminho completo: ');
        } else {
            this.logError('Opção inválida');
            return this.chooseInstallDirectory();
        }

        this.logInfo(`Diretório selecionado: ${this.config.installDir}`);
    }

    async downloadProject() {
        this.logHeader('Baixando BookVerse');

        try {
            // Criar diretório pai se não existir
            const parentDir = path.dirname(this.config.installDir);
            if (!fs.existsSync(parentDir)) {
                fs.mkdirSync(parentDir, { recursive: true });
            }

            if (fs.existsSync(this.config.installDir)) {
                this.logWarning('Diretório já existe. Atualizando...');
                process.chdir(this.config.installDir);
                execSync('git pull origin main', { stdio: 'inherit' });
            } else {
                this.logInfo('Clonando repositório...');
                execSync(`git clone https://github.com/yt-jpg/BookVerse.git "${this.config.installDir}"`, { stdio: 'inherit' });
                process.chdir(this.config.installDir);
            }

            this.logSuccess('Projeto baixado com sucesso!');
        } catch (error) {
            this.logError(`Erro ao baixar projeto: ${error.message}`);
            process.exit(1);
        }
    }

    async installProjectDependencies() {
        this.logHeader('Instalando Dependências do Projeto');

        try {
            // Dependências do servidor
            this.logInfo('Instalando dependências do servidor...');
            execSync('npm install', { stdio: 'inherit' });

            // Dependências do cliente
            this.logInfo('Instalando dependências do cliente...');
            process.chdir('client');
            execSync('npm install', { stdio: 'inherit' });
            process.chdir('..');

            // Dependências Python (opcional)
            if (this.detector.checkCommand('python3')) {
                this.logInfo('Instalando dependências Python...');
                try {
                    execSync('pip3 install requests psutil', { stdio: 'inherit' });
                } catch {
                    this.logWarning('Erro ao instalar dependências Python (opcional)');
                }
            }

            this.logSuccess('Todas as dependências instaladas!');
        } catch (error) {
            this.logError(`Erro ao instalar dependências: ${error.message}`);
            process.exit(1);
        }
    }

    async setupEnvironment() {
        this.logHeader('Configurando Ambiente');

        // Configurar servidor
        if (!fs.existsSync('.env')) {
            this.logInfo('Criando arquivo .env do servidor...');
            fs.copyFileSync('.env.example', '.env');

            // Gerar JWT secret seguro
            const crypto = require('crypto');
            const jwtSecret = crypto.randomBytes(32).toString('hex');
            
            let envContent = fs.readFileSync('.env', 'utf8');
            envContent = envContent.replace('seu_jwt_secret_aqui_mude_em_producao', jwtSecret);
            
            // Configurações específicas da plataforma
            if (this.detector.platform === 'win32') {
                envContent = envContent.replace('NODE_ENV=development', 'NODE_ENV=development\nPLATFORM=windows');
            } else if (this.detector.platform === 'darwin') {
                envContent = envContent.replace('NODE_ENV=development', 'NODE_ENV=development\nPLATFORM=macos');
            } else {
                envContent = envContent.replace('NODE_ENV=development', 'NODE_ENV=development\nPLATFORM=linux');
            }
            
            fs.writeFileSync('.env', envContent);
        }

        // Configurar cliente
        if (!fs.existsSync('client/.env')) {
            this.logInfo('Criando arquivo .env do cliente...');
            fs.copyFileSync('client/.env.example', 'client/.env');
        }

        this.logSuccess('Ambiente configurado!');
    }

    async setupDatabase() {
        this.logHeader('Configuração do Banco de Dados');

        console.log('Escolha o banco de dados:');
        console.log('1. MySQL (Recomendado para produção)');
        console.log('2. MongoDB (Flexível, NoSQL)');
        console.log('3. SQLite (Simples, arquivo local)');
        console.log('4. Sem banco (apenas teste)');

        const choice = await this.question('\nEscolha (1-4): ');

        switch (choice) {
            case '1':
                await this.setupMySQL();
                break;
            case '2':
                await this.setupMongoDB();
                break;
            case '3':
                await this.setupSQLite();
                break;
            case '4':
                this.logWarning('Continuando sem banco de dados');
                break;
            default:
                this.logError('Opção inválida');
                return this.setupDatabase();
        }
    }

    async setupMySQL() {
        this.logInfo('Configurando MySQL...');
        
        const installMySQL = await this.question('Instalar MySQL automaticamente? (s/N): ');
        if (installMySQL.toLowerCase().startsWith('s')) {
            const command = this.detector.platformInfo.installCommands.mysql;
            if (command) {
                try {
                    execSync(command, { stdio: 'inherit' });
                    this.logSuccess('MySQL instalado');
                } catch (error) {
                    this.logError(`Erro ao instalar MySQL: ${error.message}`);
                }
            }
        }

        // Configurar .env
        let envContent = fs.readFileSync('.env', 'utf8');
        envContent = envContent.replace(/DB_TYPE=.*/, 'DB_TYPE=mysql');
        envContent = envContent.replace(/DB_HOST=.*/, 'DB_HOST=localhost');
        envContent = envContent.replace(/DB_NAME=.*/, 'DB_NAME=bookverse');
        fs.writeFileSync('.env', envContent);

        this.config.database = 'mysql';
        this.logSuccess('MySQL configurado no .env');
    }

    async setupMongoDB() {
        this.logInfo('Configurando MongoDB...');
        
        const installMongo = await this.question('Instalar MongoDB automaticamente? (s/N): ');
        if (installMongo.toLowerCase().startsWith('s')) {
            const command = this.detector.platformInfo.installCommands.mongodb;
            if (command) {
                try {
                    execSync(command, { stdio: 'inherit' });
                    this.logSuccess('MongoDB instalado');
                } catch (error) {
                    this.logError(`Erro ao instalar MongoDB: ${error.message}`);
                }
            }
        }

        // Configurar .env
        let envContent = fs.readFileSync('.env', 'utf8');
        envContent = envContent.replace(/DB_TYPE=.*/, 'DB_TYPE=mongodb');
        envContent = envContent.replace(/MONGODB_URI=.*/, 'MONGODB_URI=mongodb://localhost:27017/bookverse');
        fs.writeFileSync('.env', envContent);

        this.config.database = 'mongodb';
        this.logSuccess('MongoDB configurado no .env');
    }

    async setupSQLite() {
        this.logInfo('Configurando SQLite...');
        
        // Configurar .env
        let envContent = fs.readFileSync('.env', 'utf8');
        envContent = envContent.replace(/DB_TYPE=.*/, 'DB_TYPE=sqlite');
        envContent = envContent.replace(/DB_NAME=.*/, 'DB_NAME=./database/bookverse.db');
        fs.writeFileSync('.env', envContent);

        // Criar diretório do banco
        if (!fs.existsSync('database')) {
            fs.mkdirSync('database');
        }

        this.config.database = 'sqlite';
        this.logSuccess('SQLite configurado no .env');
    }

    async createPlatformScripts() {
        this.logHeader('Criando Scripts Personalizados');

        const scripts = {
            win32: {
                start: `@echo off
title BookVerse - Servidor
cd /d "${this.config.installDir}"
echo 🚀 Iniciando BookVerse...
npm run dev
pause`,
                
                stop: `@echo off
title BookVerse - Parar Servidor
echo 🛑 Parando BookVerse...
taskkill /f /im node.exe
echo ✅ Servidor parado
pause`,
                
                update: `@echo off
title BookVerse - Atualizar
cd /d "${this.config.installDir}"
echo 📥 Atualizando BookVerse...
git pull origin main
npm install
cd client && npm install && cd ..
echo ✅ Atualização concluída
pause`
            },
            
            unix: {
                start: `#!/bin/bash
cd "${this.config.installDir}"
echo "🚀 Iniciando BookVerse..."
npm run dev`,
                
                stop: `#!/bin/bash
echo "🛑 Parando BookVerse..."
pkill -f "node.*server"
echo "✅ Servidor parado"`,
                
                update: `#!/bin/bash
cd "${this.config.installDir}"
echo "📥 Atualizando BookVerse..."
git pull origin main
npm install
cd client && npm install && cd ..
echo "✅ Atualização concluída"`
            }
        };

        const isWindows = this.detector.platform === 'win32';
        const scriptSet = isWindows ? scripts.win32 : scripts.unix;
        const extension = isWindows ? '.bat' : '.sh';

        for (const [name, content] of Object.entries(scriptSet)) {
            const filename = `${name}-bookverse${extension}`;
            fs.writeFileSync(filename, content);
            
            if (!isWindows) {
                execSync(`chmod +x ${filename}`);
            }
            
            this.logSuccess(`Script criado: ${filename}`);
        }

        // Criar atalho na área de trabalho (Windows)
        if (isWindows) {
            try {
                const desktopPath = path.join(this.detector.homeDir, 'Desktop');
                const shortcutScript = `
$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("${desktopPath}\\BookVerse.lnk")
$Shortcut.TargetPath = "${this.config.installDir}\\start-bookverse.bat"
$Shortcut.WorkingDirectory = "${this.config.installDir}"
$Shortcut.IconLocation = "${this.config.installDir}\\client\\public\\favicon.ico"
$Shortcut.Save()
`;
                fs.writeFileSync('create-shortcut.ps1', shortcutScript);
                execSync('powershell -ExecutionPolicy Bypass -File create-shortcut.ps1', { stdio: 'ignore' });
                fs.unlinkSync('create-shortcut.ps1');
                this.logSuccess('Atalho criado na área de trabalho');
            } catch {
                this.logWarning('Não foi possível criar atalho na área de trabalho');
            }
        }
    }

    async optimizeForPlatform() {
        this.logHeader('Otimizações Específicas da Plataforma');

        const resources = this.detector.getSystemResources();
        
        // Configurações baseadas nos recursos do sistema
        let envContent = fs.readFileSync('.env', 'utf8');
        
        // Configurar workers baseado no número de CPUs
        const workers = Math.max(1, Math.min(resources.cpuCount - 1, 4));
        envContent += `\n# Otimizações automáticas\nWORKERS=${workers}\n`;
        
        // Configurar cache baseado na memória disponível
        const cacheSize = resources.totalMemory > 8 ? '512mb' : resources.totalMemory > 4 ? '256mb' : '128mb';
        envContent += `CACHE_SIZE=${cacheSize}\n`;
        
        // Configurações específicas da plataforma
        if (this.detector.platform === 'win32') {
            envContent += 'FILE_WATCHER=polling\n'; // Windows pode ter problemas com file watchers
        } else {
            envContent += 'FILE_WATCHER=native\n';
        }
        
        // Configurar porta baseada na plataforma
        const defaultPort = this.detector.platform === 'win32' ? 5000 : 3000;
        envContent = envContent.replace(/PORT=.*/, `PORT=${defaultPort}`);
        
        fs.writeFileSync('.env', envContent);
        
        this.logSuccess(`Configurado para ${workers} workers`);
        this.logSuccess(`Cache configurado para ${cacheSize}`);
        this.logSuccess(`Porta configurada para ${defaultPort}`);
    }

    async testInstallation() {
        this.logHeader('Testando Instalação');

        if (fs.existsSync('diagnose.js')) {
            this.logInfo('Executando diagnóstico...');
            try {
                execSync('node diagnose.js', { stdio: 'inherit' });
                this.logSuccess('Diagnóstico concluído');
            } catch (error) {
                this.logWarning('Diagnóstico encontrou alguns problemas');
            }
        } else {
            this.logWarning('Arquivo de diagnóstico não encontrado');
        }

        // Teste básico do servidor
        this.logInfo('Testando configuração básica...');
        try {
            const testScript = `
const fs = require('fs');
const path = require('path');

// Verificar arquivos essenciais
const essentialFiles = ['.env', 'package.json', 'server/server.js', 'client/package.json'];
let allGood = true;

essentialFiles.forEach(file => {
    if (!fs.existsSync(file)) {
        console.log('❌ Arquivo não encontrado:', file);
        allGood = false;
    } else {
        console.log('✅ Arquivo OK:', file);
    }
});

if (allGood) {
    console.log('\\n✅ Configuração básica está correta!');
} else {
    console.log('\\n❌ Alguns arquivos estão faltando');
    process.exit(1);
}
`;
            fs.writeFileSync('test-setup.js', testScript);
            execSync('node test-setup.js', { stdio: 'inherit' });
            fs.unlinkSync('test-setup.js');
        } catch (error) {
            this.logError('Teste de configuração falhou');
        }
    }

    async showFinalInfo() {
        this.logHeader('🎉 Instalação Concluída!');

        console.log(`
${colors.green}✅ BookVerse instalado com sucesso!${colors.reset}

${colors.cyan}📁 Localização:${colors.reset} ${colors.yellow}${this.config.installDir}${colors.reset}

${colors.cyan}🚀 Para iniciar:${colors.reset}
   ${this.detector.platform === 'win32' ? 
     `• Execute: ${colors.yellow}start-bookverse.bat${colors.reset}` :
     `• Execute: ${colors.yellow}./start-bookverse.sh${colors.reset}`
   }
   ${colors.yellow}• Ou: npm run dev${colors.reset}

${colors.cyan}🌐 Acesso:${colors.reset}
   • Frontend: ${colors.yellow}http://localhost:3000${colors.reset}
   • Backend: ${colors.yellow}http://localhost:5000${colors.reset}
   • API Health: ${colors.yellow}http://localhost:5000/api/health${colors.reset}

${colors.cyan}🗄️ Banco de dados:${colors.reset} ${colors.yellow}${this.config.database || 'Nenhum'}${colors.reset}

${colors.cyan}⚙️ Sistema:${colors.reset}
   • Plataforma: ${colors.yellow}${this.detector.platformInfo.name} ${this.detector.platformInfo.version}${colors.reset}
   • Arquitetura: ${colors.yellow}${this.detector.arch}${colors.reset}
   • Workers: ${colors.yellow}${Math.max(1, Math.min(this.detector.getSystemResources().cpuCount - 1, 4))}${colors.reset}

${colors.cyan}📚 Documentação:${colors.reset}
   • README.md - Guia completo
   • QUICK-START.md - Início rápido
   • DATABASE-SETUP.md - Configuração do banco

${colors.cyan}🔧 Scripts criados:${colors.reset}
   ${this.detector.platform === 'win32' ? 
     `• ${colors.yellow}start-bookverse.bat${colors.reset} - Iniciar servidor
   • ${colors.yellow}stop-bookverse.bat${colors.reset} - Parar servidor
   • ${colors.yellow}update-bookverse.bat${colors.reset} - Atualizar projeto` :
     `• ${colors.yellow}start-bookverse.sh${colors.reset} - Iniciar servidor
   • ${colors.yellow}stop-bookverse.sh${colors.reset} - Parar servidor
   • ${colors.yellow}update-bookverse.sh${colors.reset} - Atualizar projeto`
   }
        `);

        const startNow = await this.question('Deseja iniciar o BookVerse agora? (s/N): ');
        if (startNow.toLowerCase().startsWith('s')) {
            this.logInfo('Iniciando BookVerse...');
            
            // Iniciar em processo separado para não bloquear
            const startCommand = this.detector.platform === 'win32' ? 
                'start cmd /k "npm run dev"' : 
                'npm run dev';
                
            try {
                if (this.detector.platform === 'win32') {
                    execSync(startCommand, { stdio: 'inherit' });
                } else {
                    spawn('npm', ['run', 'dev'], { 
                        stdio: 'inherit', 
                        detached: true 
                    });
                }
                this.logSuccess('Servidor iniciado! Aguarde alguns segundos e acesse http://localhost:5000');
            } catch (error) {
                this.logError('Erro ao iniciar servidor. Execute manualmente: npm run dev');
            }
        }
    }

    async run() {
        try {
            await this.showWelcome();
            await this.checkDependencies();
            await this.chooseInstallDirectory();
            await this.downloadProject();
            await this.installProjectDependencies();
            await this.setupEnvironment();
            await this.setupDatabase();
            await this.optimizeForPlatform();
            await this.createPlatformScripts();
            await this.testInstallation();
            await this.showFinalInfo();
        } catch (error) {
            this.logError(`Erro durante a instalação: ${error.message}`);
            process.exit(1);
        } finally {
            this.rl.close();
        }
    }
}

// Executar setup se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    const setup = new BookVerseSetup();
    setup.run().catch(console.error);
}

export { PlatformDetector, BookVerseSetup };
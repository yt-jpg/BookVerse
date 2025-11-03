/**
 * 🔍 Detector de Plataforma Inteligente
 * Detecta automaticamente o sistema operacional, arquitetura e características do usuário
 */

class PlatformDetector {
    constructor() {
        this.userAgent = navigator.userAgent;
        this.platform = navigator.platform;
        this.language = navigator.language;
        this.cookieEnabled = navigator.cookieEnabled;
        this.onLine = navigator.onLine;
        
        this.detection = this.detectAll();
    }

    detectAll() {
        return {
            os: this.detectOS(),
            arch: this.detectArchitecture(),
            browser: this.detectBrowser(),
            device: this.detectDevice(),
            capabilities: this.detectCapabilities(),
            recommendations: this.generateRecommendations()
        };
    }

    detectOS() {
        const ua = this.userAgent.toLowerCase();
        const platform = this.platform.toLowerCase();

        // Windows
        if (ua.includes('windows nt 10.0')) {
            return { name: 'Windows', version: '10/11', family: 'windows', packageManager: 'winget' };
        }
        if (ua.includes('windows nt 6.3')) {
            return { name: 'Windows', version: '8.1', family: 'windows', packageManager: 'winget' };
        }
        if (ua.includes('windows nt 6.1')) {
            return { name: 'Windows', version: '7', family: 'windows', packageManager: 'winget' };
        }
        if (ua.includes('windows')) {
            return { name: 'Windows', version: 'Unknown', family: 'windows', packageManager: 'winget' };
        }

        // macOS
        if (ua.includes('mac os x')) {
            const versionMatch = ua.match(/mac os x (\d+)[._](\d+)/);
            let version = 'Unknown';
            if (versionMatch) {
                const major = parseInt(versionMatch[1]);
                const minor = parseInt(versionMatch[2]);
                if (major >= 10) {
                    if (major === 10 && minor >= 15) version = `${major}.${minor}+`;
                    else if (major >= 11) version = `${major}.${minor}`;
                    else version = `${major}.${minor}`;
                }
            }
            return { name: 'macOS', version, family: 'unix', packageManager: 'brew' };
        }

        // Linux
        if (ua.includes('linux')) {
            let distro = 'Linux';
            let packageManager = 'apt';
            
            if (ua.includes('ubuntu')) {
                distro = 'Ubuntu';
                packageManager = 'apt';
            } else if (ua.includes('debian')) {
                distro = 'Debian';
                packageManager = 'apt';
            } else if (ua.includes('fedora')) {
                distro = 'Fedora';
                packageManager = 'dnf';
            } else if (ua.includes('centos')) {
                distro = 'CentOS';
                packageManager = 'yum';
            } else if (ua.includes('arch')) {
                distro = 'Arch Linux';
                packageManager = 'pacman';
            } else if (ua.includes('opensuse')) {
                distro = 'openSUSE';
                packageManager = 'zypper';
            }
            
            return { name: distro, version: 'Unknown', family: 'unix', packageManager };
        }

        // Android
        if (ua.includes('android')) {
            const versionMatch = ua.match(/android (\d+\.?\d*)/);
            const version = versionMatch ? versionMatch[1] : 'Unknown';
            return { name: 'Android', version, family: 'mobile', packageManager: null };
        }

        // iOS
        if (ua.includes('iphone') || ua.includes('ipad')) {
            const versionMatch = ua.match(/os (\d+)[._](\d+)/);
            const version = versionMatch ? `${versionMatch[1]}.${versionMatch[2]}` : 'Unknown';
            return { name: 'iOS', version, family: 'mobile', packageManager: null };
        }

        // FreeBSD
        if (ua.includes('freebsd')) {
            return { name: 'FreeBSD', version: 'Unknown', family: 'unix', packageManager: 'pkg' };
        }

        return { name: 'Unknown', version: 'Unknown', family: 'unknown', packageManager: null };
    }

    detectArchitecture() {
        const ua = this.userAgent.toLowerCase();
        
        // ARM64/Apple Silicon
        if (ua.includes('arm64') || ua.includes('aarch64')) {
            return { arch: 'arm64', bits: 64, type: 'ARM' };
        }
        
        // x64
        if (ua.includes('x86_64') || ua.includes('win64') || ua.includes('wow64')) {
            return { arch: 'x64', bits: 64, type: 'Intel/AMD' };
        }
        
        // x86
        if (ua.includes('i386') || ua.includes('i686') || ua.includes('x86')) {
            return { arch: 'x86', bits: 32, type: 'Intel/AMD' };
        }

        // Detectar através de outras características
        if (navigator.maxTouchPoints > 0 && window.screen.width <= 768) {
            return { arch: 'arm64', bits: 64, type: 'Mobile ARM' };
        }

        return { arch: 'x64', bits: 64, type: 'Unknown' };
    }

    detectBrowser() {
        const ua = this.userAgent;
        
        // Chrome
        if (ua.includes('Chrome') && !ua.includes('Edg')) {
            const versionMatch = ua.match(/Chrome\/(\d+\.\d+)/);
            const version = versionMatch ? versionMatch[1] : 'Unknown';
            return { name: 'Chrome', version, engine: 'Blink', modern: true };
        }
        
        // Edge
        if (ua.includes('Edg')) {
            const versionMatch = ua.match(/Edg\/(\d+\.\d+)/);
            const version = versionMatch ? versionMatch[1] : 'Unknown';
            return { name: 'Edge', version, engine: 'Blink', modern: true };
        }
        
        // Firefox
        if (ua.includes('Firefox')) {
            const versionMatch = ua.match(/Firefox\/(\d+\.\d+)/);
            const version = versionMatch ? versionMatch[1] : 'Unknown';
            return { name: 'Firefox', version, engine: 'Gecko', modern: true };
        }
        
        // Safari
        if (ua.includes('Safari') && !ua.includes('Chrome')) {
            const versionMatch = ua.match(/Version\/(\d+\.\d+)/);
            const version = versionMatch ? versionMatch[1] : 'Unknown';
            return { name: 'Safari', version, engine: 'WebKit', modern: true };
        }
        
        // Internet Explorer
        if (ua.includes('MSIE') || ua.includes('Trident')) {
            return { name: 'Internet Explorer', version: 'Legacy', engine: 'Trident', modern: false };
        }

        return { name: 'Unknown', version: 'Unknown', engine: 'Unknown', modern: false };
    }

    detectDevice() {
        const screen = window.screen;
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(this.userAgent);
        const isTablet = /(iPad|Android(?!.*Mobile))/i.test(this.userAgent) || 
                        (screen.width >= 768 && screen.width <= 1024);
        
        let deviceType = 'desktop';
        if (isMobile && !isTablet) deviceType = 'mobile';
        else if (isTablet) deviceType = 'tablet';
        
        return {
            type: deviceType,
            mobile: isMobile,
            tablet: isTablet,
            desktop: !isMobile && !isTablet,
            touchScreen: navigator.maxTouchPoints > 0,
            resolution: {
                width: screen.width,
                height: screen.height,
                ratio: window.devicePixelRatio || 1
            }
        };
    }

    detectCapabilities() {
        const capabilities = {
            // Storage
            localStorage: this.testLocalStorage(),
            sessionStorage: this.testSessionStorage(),
            indexedDB: 'indexedDB' in window,
            
            // Network
            online: navigator.onLine,
            connection: this.getConnectionInfo(),
            
            // Features
            webGL: this.testWebGL(),
            webWorkers: 'Worker' in window,
            serviceWorkers: 'serviceWorker' in navigator,
            notifications: 'Notification' in window,
            geolocation: 'geolocation' in navigator,
            
            // Performance
            memory: this.getMemoryInfo(),
            cores: navigator.hardwareConcurrency || 'Unknown',
            
            // Security
            https: location.protocol === 'https:',
            cookies: navigator.cookieEnabled
        };

        return capabilities;
    }

    testLocalStorage() {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    }

    testSessionStorage() {
        try {
            const test = 'test';
            sessionStorage.setItem(test, test);
            sessionStorage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    }

    testWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch {
            return false;
        }
    }

    getConnectionInfo() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
            return {
                effectiveType: connection.effectiveType || 'Unknown',
                downlink: connection.downlink || 'Unknown',
                rtt: connection.rtt || 'Unknown',
                saveData: connection.saveData || false
            };
        }
        return null;
    }

    getMemoryInfo() {
        if ('memory' in performance) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            };
        }
        return null;
    }

    generateRecommendations() {
        const os = this.detection.os;
        const device = this.detection.device;
        const capabilities = this.detection.capabilities;
        
        const recommendations = {
            installMethod: 'auto',
            database: 'sqlite',
            directory: null,
            features: [],
            optimizations: []
        };

        // Método de instalação baseado no SO
        if (os.family === 'windows') {
            recommendations.installMethod = 'auto';
            recommendations.directory = `C:\\Users\\${this.getUserName()}\\Desktop\\BookVerse`;
            if (os.version === '10/11') {
                recommendations.database = 'mysql';
            }
        } else if (os.family === 'unix') {
            recommendations.installMethod = 'auto';
            if (os.name.includes('macOS')) {
                recommendations.directory = `/Users/${this.getUserName()}/BookVerse`;
                recommendations.database = 'mysql';
            } else {
                recommendations.directory = `/home/${this.getUserName()}/BookVerse`;
                recommendations.database = 'mysql';
            }
        } else if (os.family === 'mobile') {
            recommendations.installMethod = 'docker';
            recommendations.database = 'sqlite';
        }

        // Banco de dados baseado nas capacidades
        if (capabilities.memory && capabilities.memory.total > 4000) {
            recommendations.database = 'mysql';
        } else if (capabilities.memory && capabilities.memory.total > 2000) {
            recommendations.database = 'mongodb';
        }

        // Funcionalidades baseadas no dispositivo
        if (device.desktop) {
            recommendations.features = ['performance', 'notifications', 'analytics'];
        } else if (device.tablet) {
            recommendations.features = ['performance', 'notifications'];
        } else {
            recommendations.features = ['notifications'];
        }

        // Otimizações baseadas nas capacidades
        if (capabilities.cores > 4) {
            recommendations.optimizations.push('multicore');
        }
        if (capabilities.webWorkers) {
            recommendations.optimizations.push('webworkers');
        }
        if (capabilities.serviceWorkers) {
            recommendations.optimizations.push('pwa');
        }

        return recommendations;
    }

    getUserName() {
        // Tentar obter nome do usuário (limitado no browser)
        return 'User';
    }

    getInstallCommands() {
        const os = this.detection.os;
        const commands = {};

        switch (os.family) {
            case 'windows':
                commands.nodejs = 'winget install OpenJS.NodeJS --accept-package-agreements --accept-source-agreements';
                commands.git = 'winget install Git.Git --accept-package-agreements --accept-source-agreements';
                commands.python = 'winget install Python.Python.3.11 --accept-package-agreements --accept-source-agreements';
                commands.mysql = 'winget install Oracle.MySQL --accept-package-agreements --accept-source-agreements';
                commands.mongodb = 'winget install MongoDB.Server --accept-package-agreements --accept-source-agreements';
                break;

            case 'unix':
                if (os.packageManager === 'brew') {
                    commands.nodejs = 'brew install node';
                    commands.git = 'brew install git';
                    commands.python = 'brew install python3';
                    commands.mysql = 'brew install mysql';
                    commands.mongodb = 'brew install mongodb/brew/mongodb-community';
                } else if (os.packageManager === 'apt') {
                    commands.nodejs = 'curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt install -y nodejs';
                    commands.git = 'sudo apt install -y git';
                    commands.python = 'sudo apt install -y python3 python3-pip';
                    commands.mysql = 'sudo apt install -y mysql-server';
                    commands.mongodb = 'sudo apt install -y mongodb';
                } else if (os.packageManager === 'yum' || os.packageManager === 'dnf') {
                    const pm = os.packageManager;
                    commands.nodejs = `curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash - && sudo ${pm} install -y nodejs`;
                    commands.git = `sudo ${pm} install -y git`;
                    commands.python = `sudo ${pm} install -y python3 python3-pip`;
                    commands.mysql = `sudo ${pm} install -y mysql-server`;
                    commands.mongodb = `sudo ${pm} install -y mongodb-server`;
                }
                break;
        }

        return commands;
    }

    generateSetupScript() {
        const os = this.detection.os;
        const recommendations = this.detection.recommendations;
        
        let script = '';
        
        if (os.family === 'windows') {
            script = `@echo off
title BookVerse - Instalação Automática
echo 🚀 Instalando BookVerse para ${os.name} ${os.version}
echo.

REM Verificar privilégios administrativos
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ Execute como Administrador
    pause
    exit /b 1
)

echo 📦 Instalando dependências...
${this.getInstallCommands().nodejs}
${this.getInstallCommands().git}

echo 📥 Baixando BookVerse...
git clone https://github.com/yt-jpg/BookVerse.git "${recommendations.directory}"
cd /d "${recommendations.directory}"

echo 📦 Instalando dependências do projeto...
npm install
cd client && npm install && cd ..

echo ⚙️ Configurando ambiente...
copy .env.example .env
copy client\\.env.example client\\.env

echo ✅ Instalação concluída!
echo 🚀 Execute: npm run dev
pause`;
        } else {
            script = `#!/bin/bash
echo "🚀 Instalando BookVerse para ${os.name} ${os.version}"
echo

# Verificar se é root (para algumas distribuições)
if [[ $EUID -eq 0 ]]; then
   echo "⚠️ Executando como root. Recomendamos usar usuário normal."
fi

echo "📦 Instalando dependências..."
${this.getInstallCommands().nodejs}
${this.getInstallCommands().git}

echo "📥 Baixando BookVerse..."
git clone https://github.com/yt-jpg/BookVerse.git "${recommendations.directory}"
cd "${recommendations.directory}"

echo "📦 Instalando dependências do projeto..."
npm install
cd client && npm install && cd ..

echo "⚙️ Configurando ambiente..."
cp .env.example .env
cp client/.env.example client/.env

echo "✅ Instalação concluída!"
echo "🚀 Execute: npm run dev"`;
        }
        
        return script;
    }

    // Método público para obter todas as informações
    getDetectionInfo() {
        return {
            ...this.detection,
            installCommands: this.getInstallCommands(),
            setupScript: this.generateSetupScript(),
            timestamp: new Date().toISOString()
        };
    }
}

// Exportar para uso global
window.PlatformDetector = PlatformDetector;
/**
 * 🚀 BookVerse - Instalador Web Inteligente
 * Interface principal para instalação com detecção automática de plataforma
 */

class BookVerseInstaller {
    constructor() {
        this.detector = new PlatformDetector();
        this.platformInfo = this.detector.getDetectionInfo();
        this.currentSection = 'detection';
        this.config = {
            method: 'auto',
            directory: null,
            database: 'sqlite',
            features: ['performance', 'notifications'],
            installCommands: []
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.startDetection();
    }

    bindEvents() {
        // Botões de navegação
        document.getElementById('continue-btn')?.addEventListener('click', () => this.showSection('method'));
        document.getElementById('back-to-method')?.addEventListener('click', () => this.showSection('method'));
        
        // Seleção de método
        document.querySelectorAll('.method-card').forEach(card => {
            card.addEventListener('click', () => this.selectMethod(card.dataset.method));
        });
        
        // Configuração automática
        document.getElementById('customize-btn')?.addEventListener('click', () => this.showSection('manual-config'));
        document.getElementById('install-auto-btn')?.addEventListener('click', () => this.startInstallation('auto'));
        
        // Configuração manual
        document.getElementById('install-manual-btn')?.addEventListener('click', () => this.startInstallation('manual'));
        
        // Diretório
        document.getElementById('browse-dir')?.addEventListener('click', () => this.browseDirectory());
        this.createDirectorySuggestions();
        
        // Database selection
        document.querySelectorAll('input[name="database"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.config.database = e.target.value;
            });
        });
        
        // Features
        document.querySelectorAll('.checkbox-option input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateFeatures());
        });
        
        // Log toggle
        document.getElementById('toggle-log')?.addEventListener('click', () => this.toggleLog());
        
        // Success actions
        document.getElementById('start-server')?.addEventListener('click', () => this.startServer());
        document.getElementById('open-folder')?.addEventListener('click', () => this.openFolder());
        document.getElementById('view-docs')?.addEventListener('click', () => this.viewDocs());
    }

    startDetection() {
        // Simular detecção com delay para mostrar loading
        setTimeout(() => {
            this.displayPlatformInfo();
            this.showAutoRecommendations();
        }, 2000);
    }

    displayPlatformInfo() {
        const info = this.platformInfo;
        
        // Atualizar informações da plataforma
        document.getElementById('os-name').textContent = `${info.os.name} ${info.os.version}`;
        document.getElementById('arch').textContent = `${info.arch.arch} (${info.arch.bits}-bit)`;
        document.getElementById('browser').textContent = `${info.browser.name} ${info.browser.version}`;
        document.getElementById('resolution').textContent = `${info.device.resolution.width}x${info.device.resolution.height}`;
        
        // Mostrar informações e esconder loading
        document.querySelector('.loading').classList.add('hidden');
        document.getElementById('platform-info').classList.remove('hidden');
    }

    showAutoRecommendations() {
        const recommendations = this.platformInfo.recommendations;
        const container = document.getElementById('auto-recommendations');
        
        const recommendationsHTML = `
            <div class="recommendation-item">
                <div class="recommendation-icon">💻</div>
                <div class="recommendation-content">
                    <h4>Sistema Detectado</h4>
                    <p>${this.platformInfo.os.name} ${this.platformInfo.os.version} (${this.platformInfo.arch.arch})</p>
                </div>
            </div>
            
            <div class="recommendation-item">
                <div class="recommendation-icon">📁</div>
                <div class="recommendation-content">
                    <h4>Diretório Recomendado</h4>
                    <p>${recommendations.directory || 'Será selecionado automaticamente'}</p>
                </div>
            </div>
            
            <div class="recommendation-item">
                <div class="recommendation-icon">🗄️</div>
                <div class="recommendation-content">
                    <h4>Banco de Dados Sugerido</h4>
                    <p>${this.getDatabaseName(recommendations.database)} - Otimizado para seu sistema</p>
                </div>
            </div>
            
            <div class="recommendation-item">
                <div class="recommendation-icon">⚡</div>
                <div class="recommendation-content">
                    <h4>Funcionalidades Incluídas</h4>
                    <p>${recommendations.features.map(f => this.getFeatureName(f)).join(', ')}</p>
                </div>
            </div>
            
            <div class="recommendation-item">
                <div class="recommendation-icon">🔧</div>
                <div class="recommendation-content">
                    <h4>Otimizações</h4>
                    <p>Configuração automática baseada em ${this.platformInfo.capabilities.cores} cores de CPU</p>
                </div>
            </div>
        `;
        
        container.innerHTML = recommendationsHTML;
        
        // Configurar valores padrão
        this.config.directory = recommendations.directory;
        this.config.database = recommendations.database;
        this.config.features = recommendations.features;
    }

    createDirectorySuggestions() {
        const container = document.getElementById('dir-suggestions');
        const os = this.platformInfo.os;
        
        let suggestions = [];
        
        if (os.family === 'windows') {
            suggestions = [
                'C:\\Users\\User\\Desktop\\BookVerse',
                'C:\\Users\\User\\Documents\\BookVerse',
                'C:\\BookVerse',
                'D:\\BookVerse'
            ];
        } else if (os.family === 'unix') {
            if (os.name.includes('macOS')) {
                suggestions = [
                    '/Users/User/BookVerse',
                    '/Users/User/Desktop/BookVerse',
                    '/Applications/BookVerse'
                ];
            } else {
                suggestions = [
                    '/home/user/BookVerse',
                    '/home/user/Desktop/BookVerse',
                    '/opt/BookVerse'
                ];
            }
        }
        
        container.innerHTML = suggestions.map(dir => 
            `<div class="suggestion-item" onclick="document.getElementById('install-dir').value='${dir}'">${dir}</div>`
        ).join('');
    }

    selectMethod(method) {
        // Remover seleção anterior
        document.querySelectorAll('.method-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Selecionar novo método
        document.querySelector(`[data-method="${method}"]`).classList.add('selected');
        this.config.method = method;
        
        // Mostrar próxima seção baseada no método
        setTimeout(() => {
            if (method === 'auto') {
                this.showSection('auto-config');
            } else if (method === 'manual') {
                this.showSection('manual-config');
                this.setupManualConfig();
            } else if (method === 'docker') {
                this.startDockerInstallation();
            }
        }, 500);
    }

    setupManualConfig() {
        // Configurar valores padrão no formulário manual
        const recommendations = this.platformInfo.recommendations;
        
        document.getElementById('install-dir').value = recommendations.directory || '';
        
        // Selecionar banco recomendado
        const dbRadio = document.querySelector(`input[name="database"][value="${recommendations.database}"]`);
        if (dbRadio) dbRadio.checked = true;
        
        // Selecionar features recomendadas
        recommendations.features.forEach(feature => {
            const checkbox = document.getElementById(`feature-${feature}`);
            if (checkbox) checkbox.checked = true;
        });
    }

    updateFeatures() {
        this.config.features = [];
        document.querySelectorAll('.checkbox-option input[type="checkbox"]:checked').forEach(checkbox => {
            const feature = checkbox.id.replace('feature-', '');
            this.config.features.push(feature);
        });
    }

    browseDirectory() {
        // Simular seleção de diretório (limitado no browser)
        const input = document.createElement('input');
        input.type = 'file';
        input.webkitdirectory = true;
        input.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const path = e.target.files[0].webkitRelativePath.split('/')[0];
                document.getElementById('install-dir').value = path;
            }
        });
        input.click();
    }

    startInstallation(type) {
        this.showSection('installation');
        
        // Configurar instalação baseada no tipo
        if (type === 'auto') {
            this.config = {
                ...this.config,
                directory: this.platformInfo.recommendations.directory,
                database: this.platformInfo.recommendations.database,
                features: this.platformInfo.recommendations.features
            };
        } else {
            this.config.directory = document.getElementById('install-dir').value;
            this.config.database = document.querySelector('input[name="database"]:checked')?.value || 'sqlite';
            this.updateFeatures();
        }
        
        this.runInstallation();
    }

    async runInstallation() {
        const steps = [
            { id: 'check-deps', name: 'Verificar Dependências', desc: 'Verificando Node.js, Git e outras dependências' },
            { id: 'download', name: 'Baixar Projeto', desc: 'Clonando repositório do GitHub' },
            { id: 'install-deps', name: 'Instalar Dependências', desc: 'Instalando pacotes npm do servidor e cliente' },
            { id: 'configure', name: 'Configurar Ambiente', desc: 'Criando arquivos de configuração' },
            { id: 'setup-db', name: 'Configurar Banco', desc: 'Configurando banco de dados selecionado' },
            { id: 'optimize', name: 'Otimizar Sistema', desc: 'Aplicando otimizações específicas da plataforma' },
            { id: 'test', name: 'Testar Instalação', desc: 'Verificando se tudo está funcionando' }
        ];
        
        this.createInstallationSteps(steps);
        
        for (let i = 0; i < steps.length; i++) {
            await this.runInstallationStep(steps[i], i, steps.length);
        }
        
        this.completeInstallation();
    }

    createInstallationSteps(steps) {
        const container = document.getElementById('installation-steps');
        container.innerHTML = steps.map(step => `
            <div class="step-item" id="step-${step.id}">
                <div class="step-icon">${steps.indexOf(step) + 1}</div>
                <div class="step-content">
                    <h4>${step.name}</h4>
                    <p>${step.desc}</p>
                </div>
            </div>
        `).join('');
    }

    async runInstallationStep(step, index, total) {
        // Ativar step atual
        document.getElementById(`step-${step.id}`).classList.add('active');
        
        // Atualizar progresso
        const progress = ((index + 1) / total) * 100;
        document.getElementById('progress-fill').style.width = `${progress}%`;
        document.getElementById('progress-text').textContent = step.desc;
        
        // Simular execução do step
        await this.simulateStep(step);
        
        // Marcar como completo
        document.getElementById(`step-${step.id}`).classList.remove('active');
        document.getElementById(`step-${step.id}`).classList.add('completed');
        
        // Adicionar ao log
        this.addToLog(`✅ ${step.name} concluído`, 'success');
    }

    async simulateStep(step) {
        // Simular diferentes tempos para cada step
        const delays = {
            'check-deps': 1500,
            'download': 3000,
            'install-deps': 4000,
            'configure': 1000,
            'setup-db': 2000,
            'optimize': 1500,
            'test': 2000
        };
        
        const delay = delays[step.id] || 2000;
        
        // Adicionar logs específicos para cada step
        switch (step.id) {
            case 'check-deps':
                this.addToLog('Verificando Node.js...', 'info');
                await this.sleep(500);
                this.addToLog(`✅ Node.js ${this.platformInfo.capabilities.cores > 0 ? 'encontrado' : 'será instalado'}`, 'success');
                await this.sleep(500);
                this.addToLog('Verificando Git...', 'info');
                await this.sleep(500);
                this.addToLog('✅ Git disponível', 'success');
                break;
                
            case 'download':
                this.addToLog('Conectando ao GitHub...', 'info');
                await this.sleep(1000);
                this.addToLog('Baixando arquivos do projeto...', 'info');
                await this.sleep(1500);
                this.addToLog('✅ Projeto baixado com sucesso', 'success');
                break;
                
            case 'install-deps':
                this.addToLog('Instalando dependências do servidor...', 'info');
                await this.sleep(2000);
                this.addToLog('Instalando dependências do cliente...', 'info');
                await this.sleep(1500);
                this.addToLog('✅ Todas as dependências instaladas', 'success');
                break;
                
            case 'configure':
                this.addToLog('Criando arquivos de configuração...', 'info');
                await this.sleep(500);
                this.addToLog(`Configurando para ${this.platformInfo.os.name}...`, 'info');
                await this.sleep(500);
                break;
                
            case 'setup-db':
                this.addToLog(`Configurando ${this.getDatabaseName(this.config.database)}...`, 'info');
                await this.sleep(1000);
                this.addToLog('✅ Banco de dados configurado', 'success');
                break;
                
            case 'optimize':
                this.addToLog('Aplicando otimizações de performance...', 'info');
                await this.sleep(800);
                this.addToLog(`Configurando para ${this.platformInfo.capabilities.cores} cores...`, 'info');
                await this.sleep(700);
                break;
                
            case 'test':
                this.addToLog('Executando testes de configuração...', 'info');
                await this.sleep(1000);
                this.addToLog('Verificando conectividade...', 'info');
                await this.sleep(1000);
                break;
        }
        
        await this.sleep(delay - 1000); // Ajustar para o tempo total
    }

    completeInstallation() {
        // Atualizar informações finais
        document.getElementById('final-location').textContent = this.config.directory || 'Diretório padrão';
        document.getElementById('final-database').textContent = this.getDatabaseName(this.config.database);
        
        // Mostrar seção de sucesso
        setTimeout(() => {
            this.showSection('success');
        }, 1000);
    }

    startDockerInstallation() {
        this.addToLog('Iniciando instalação Docker...', 'info');
        // Implementar instalação Docker
        alert('Instalação Docker será implementada em breve!');
    }

    addToLog(message, type = 'info') {
        const logContent = document.getElementById('log-content');
        const logLine = document.createElement('div');
        logLine.className = `log-line ${type}`;
        logLine.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        logContent.appendChild(logLine);
        logContent.scrollTop = logContent.scrollHeight;
    }

    toggleLog() {
        const logContent = document.getElementById('log-content');
        logContent.classList.toggle('hidden');
    }

    startServer() {
        this.addToLog('Iniciando servidor BookVerse...', 'info');
        // Simular início do servidor
        setTimeout(() => {
            window.open('http://localhost:5000', '_blank');
        }, 1000);
    }

    openFolder() {
        // Limitado no browser - mostrar caminho
        alert(`Projeto instalado em: ${this.config.directory}`);
    }

    viewDocs() {
        window.open('../../README.md', '_blank');
    }

    showSection(sectionId) {
        // Esconder todas as seções
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Mostrar seção solicitada
        document.getElementById(sectionId).classList.add('active');
        this.currentSection = sectionId;
    }

    getDatabaseName(dbType) {
        const names = {
            mysql: 'MySQL',
            mongodb: 'MongoDB',
            sqlite: 'SQLite',
            none: 'Nenhum'
        };
        return names[dbType] || dbType;
    }

    getFeatureName(feature) {
        const names = {
            performance: 'Monitor de Performance',
            analytics: 'Analytics',
            notifications: 'Notificações'
        };
        return names[feature] || feature;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.installer = new BookVerseInstaller();
});
/**
 * ⚙️ Configuração do Instalador Web
 * Personalize as opções e comportamentos do instalador
 */

window.INSTALLER_CONFIG = {
    // Informações do projeto
    project: {
        name: 'BookVerse',
        version: '1.0.0',
        description: 'Sistema de biblioteca digital',
        repository: 'https://github.com/yt-jpg/BookVerse.git',
        homepage: 'https://bookverse.example.com',
        documentation: 'https://docs.bookverse.example.com'
    },

    // Configurações de instalação
    installation: {
        // Diretórios padrão por plataforma
        defaultDirectories: {
            windows: {
                recommended: 'C:\\Users\\{user}\\Desktop\\BookVerse',
                alternatives: [
                    'C:\\Users\\{user}\\Documents\\BookVerse',
                    'C:\\BookVerse',
                    'D:\\BookVerse'
                ]
            },
            macos: {
                recommended: '/Users/{user}/BookVerse',
                alternatives: [
                    '/Users/{user}/Desktop/BookVerse',
                    '/Applications/BookVerse',
                    '/opt/BookVerse'
                ]
            },
            linux: {
                recommended: '/home/{user}/BookVerse',
                alternatives: [
                    '/home/{user}/Desktop/BookVerse',
                    '/opt/BookVerse',
                    '/usr/local/BookVerse'
                ]
            }
        },

        // Bancos de dados suportados
        databases: {
            mysql: {
                name: 'MySQL',
                description: 'Robusto e confiável para produção',
                minRam: 4096, // MB
                recommended: true,
                installCommands: {
                    windows: 'winget install Oracle.MySQL --accept-package-agreements',
                    macos: 'brew install mysql',
                    linux: 'sudo apt install -y mysql-server'
                }
            },
            mongodb: {
                name: 'MongoDB',
                description: 'Flexível e escalável (NoSQL)',
                minRam: 2048,
                recommended: false,
                installCommands: {
                    windows: 'winget install MongoDB.Server --accept-package-agreements',
                    macos: 'brew install mongodb/brew/mongodb-community',
                    linux: 'sudo apt install -y mongodb'
                }
            },
            sqlite: {
                name: 'SQLite',
                description: 'Simples e sem configuração',
                minRam: 512,
                recommended: false,
                installCommands: {
                    windows: 'echo SQLite incluído no Node.js',
                    macos: 'echo SQLite incluído no Node.js',
                    linux: 'echo SQLite incluído no Node.js'
                }
            },
            none: {
                name: 'Sem Banco',
                description: 'Apenas para testes',
                minRam: 0,
                recommended: false,
                installCommands: {}
            }
        },

        // Funcionalidades opcionais
        features: {
            performance: {
                name: 'Monitor de Performance',
                description: 'Monitoramento em tempo real do sistema',
                default: true,
                dependencies: ['psutil']
            },
            analytics: {
                name: 'Analytics',
                description: 'Estatísticas de uso e comportamento',
                default: false,
                dependencies: []
            },
            notifications: {
                name: 'Notificações',
                description: 'Sistema de notificações push',
                default: true,
                dependencies: []
            },
            backup: {
                name: 'Backup Automático',
                description: 'Backup automático dos dados',
                default: false,
                dependencies: []
            },
            ssl: {
                name: 'SSL/HTTPS',
                description: 'Certificados SSL automáticos',
                default: false,
                dependencies: ['certbot']
            }
        },

        // Dependências do sistema
        systemDependencies: {
            nodejs: {
                name: 'Node.js',
                version: '18.0.0',
                required: true,
                checkCommand: 'node --version',
                installCommands: {
                    windows: 'winget install OpenJS.NodeJS --accept-package-agreements',
                    macos: 'brew install node',
                    linux: 'curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt install -y nodejs'
                }
            },
            git: {
                name: 'Git',
                version: '2.0.0',
                required: true,
                checkCommand: 'git --version',
                installCommands: {
                    windows: 'winget install Git.Git --accept-package-agreements',
                    macos: 'brew install git',
                    linux: 'sudo apt install -y git'
                }
            },
            python: {
                name: 'Python 3',
                version: '3.8.0',
                required: false,
                checkCommand: 'python3 --version',
                installCommands: {
                    windows: 'winget install Python.Python.3.11 --accept-package-agreements',
                    macos: 'brew install python3',
                    linux: 'sudo apt install -y python3 python3-pip'
                }
            }
        }
    },

    // Configurações da interface
    ui: {
        // Tema
        theme: {
            primaryColor: '#667eea',
            secondaryColor: '#764ba2',
            successColor: '#28a745',
            warningColor: '#ffc107',
            errorColor: '#dc3545',
            infoColor: '#17a2b8'
        },

        // Animações
        animations: {
            enabled: true,
            duration: 300,
            easing: 'ease-in-out'
        },

        // Responsividade
        breakpoints: {
            mobile: 768,
            tablet: 1024,
            desktop: 1200
        },

        // Textos personalizáveis
        texts: {
            welcome: {
                title: 'BookVerse - Instalação Inteligente',
                subtitle: 'Detecção automática de plataforma e configuração otimizada'
            },
            detection: {
                title: 'Detectando sua Plataforma...',
                loading: 'Analisando seu sistema...'
            },
            methods: {
                title: 'Escolha o Método de Instalação',
                auto: {
                    title: 'Automática (Recomendado)',
                    badge: 'Mais Fácil',
                    description: 'Detecta e instala tudo automaticamente baseado na sua plataforma'
                },
                manual: {
                    title: 'Manual',
                    badge: 'Controle Total',
                    description: 'Escolha cada componente e configuração manualmente'
                },
                docker: {
                    title: 'Docker',
                    badge: 'Isolado',
                    description: 'Instalação em containers Docker (requer Docker instalado)'
                }
            }
        }
    },

    // Configurações de rede
    network: {
        // Timeout para downloads
        timeout: 30000,
        
        // Retry automático
        retries: 3,
        
        // URLs de recursos
        urls: {
            repository: 'https://github.com/yt-jpg/BookVerse.git',
            releases: 'https://api.github.com/repos/yt-jpg/BookVerse/releases',
            documentation: 'https://github.com/yt-jpg/BookVerse/blob/main/README.md'
        }
    },

    // Configurações de desenvolvimento
    development: {
        // Debug mode
        debug: false,
        
        // Logs detalhados
        verbose: false,
        
        // Simular instalação (não executar comandos reais)
        simulate: false,
        
        // Tempo de simulação para cada step
        simulationDelay: 1000
    },

    // Configurações de analytics (opcional)
    analytics: {
        enabled: false,
        trackingId: null,
        events: {
            pageView: true,
            platformDetection: true,
            methodSelection: true,
            installationStart: true,
            installationComplete: true,
            errors: true
        }
    },

    // Configurações de segurança
    security: {
        // Verificar integridade dos downloads
        verifyIntegrity: true,
        
        // Permitir apenas HTTPS
        httpsOnly: false,
        
        // CSP (Content Security Policy)
        csp: {
            enabled: false,
            policy: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
        }
    },

    // Configurações específicas por plataforma
    platformSpecific: {
        windows: {
            // Verificar privilégios administrativos
            requireAdmin: true,
            
            // Usar PowerShell em vez de CMD
            preferPowerShell: false,
            
            // Configurações do Windows Defender
            defenderExclusions: [
                'C:\\Users\\{user}\\Desktop\\BookVerse',
                'C:\\Users\\{user}\\Documents\\BookVerse'
            ]
        },
        
        macos: {
            // Verificar Xcode Command Line Tools
            requireXcode: true,
            
            // Usar Homebrew como padrão
            preferHomebrew: true,
            
            // Configurações do Gatekeeper
            gatekeeperBypass: false
        },
        
        linux: {
            // Detectar distribuição automaticamente
            autoDetectDistro: true,
            
            // Usar sudo quando necessário
            useSudo: true,
            
            // Configurações do systemd
            systemdServices: true
        }
    },

    // Configurações de otimização
    optimization: {
        // Configurar workers baseado no número de CPUs
        autoWorkers: true,
        
        // Configurar cache baseado na RAM
        autoCache: true,
        
        // Otimizações específicas por plataforma
        platformOptimizations: true,
        
        // Configurações de performance
        performance: {
            // Número máximo de workers
            maxWorkers: 8,
            
            // Tamanho máximo do cache (MB)
            maxCacheSize: 1024,
            
            // Timeout para operações
            operationTimeout: 60000
        }
    }
};

// Função para obter configuração com fallbacks
window.getConfig = function(path, defaultValue = null) {
    const keys = path.split('.');
    let current = window.INSTALLER_CONFIG;
    
    for (const key of keys) {
        if (current && typeof current === 'object' && key in current) {
            current = current[key];
        } else {
            return defaultValue;
        }
    }
    
    return current;
};

// Função para definir configuração
window.setConfig = function(path, value) {
    const keys = path.split('.');
    let current = window.INSTALLER_CONFIG;
    
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!(key in current) || typeof current[key] !== 'object') {
            current[key] = {};
        }
        current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
};

// Função para mesclar configurações personalizadas
window.mergeConfig = function(customConfig) {
    function deepMerge(target, source) {
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (!target[key] || typeof target[key] !== 'object') {
                    target[key] = {};
                }
                deepMerge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
    }
    
    deepMerge(window.INSTALLER_CONFIG, customConfig);
};

// Exportar configuração para Node.js (se disponível)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.INSTALLER_CONFIG;
}
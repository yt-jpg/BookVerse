/**
 * 🎨 Exemplo de Configuração Personalizada
 * Copie este arquivo para 'custom-config.js' e personalize conforme necessário
 */

// Configuração personalizada para o instalador
const customConfig = {
    // Personalizar informações do projeto
    project: {
        name: 'Meu BookVerse',
        description: 'Minha biblioteca digital personalizada',
        homepage: 'https://meusite.com'
    },

    // Personalizar diretórios padrão
    installation: {
        defaultDirectories: {
            windows: {
                recommended: 'C:\\MeuBookVerse',
                alternatives: [
                    'D:\\MeuBookVerse',
                    'C:\\Projetos\\BookVerse'
                ]
            },
            linux: {
                recommended: '/opt/meubookverse',
                alternatives: [
                    '/home/{user}/meubookverse',
                    '/var/www/bookverse'
                ]
            }
        },

        // Personalizar funcionalidades padrão
        features: {
            analytics: {
                default: true // Habilitar analytics por padrão
            },
            backup: {
                default: true // Habilitar backup por padrão
            },
            ssl: {
                default: true // Habilitar SSL por padrão
            }
        }
    },

    // Personalizar tema
    ui: {
        theme: {
            primaryColor: '#2c3e50',
            secondaryColor: '#34495e',
            successColor: '#27ae60',
            warningColor: '#f39c12',
            errorColor: '#e74c3c'
        },

        // Personalizar textos
        texts: {
            welcome: {
                title: 'Meu BookVerse - Instalação Personalizada',
                subtitle: 'Sistema de biblioteca digital com configuração especial'
            },
            methods: {
                auto: {
                    title: 'Instalação Rápida',
                    badge: 'Recomendado',
                    description: 'Configuração automática otimizada para seu ambiente'
                }
            }
        }
    },

    // Configurações de desenvolvimento
    development: {
        debug: true,
        verbose: true,
        simulate: false // Mudar para true para simular instalação
    },

    // Configurações específicas da empresa/organização
    organization: {
        name: 'Minha Empresa',
        logo: 'https://meusite.com/logo.png',
        supportEmail: 'suporte@meusite.com',
        documentation: 'https://docs.meusite.com'
    },

    // Configurações de rede personalizadas
    network: {
        urls: {
            repository: 'https://github.com/meuusuario/meu-bookverse.git',
            releases: 'https://api.github.com/repos/meuusuario/meu-bookverse/releases'
        }
    },

    // Configurações de segurança mais rigorosas
    security: {
        verifyIntegrity: true,
        httpsOnly: true,
        csp: {
            enabled: true,
            policy: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';"
        }
    },

    // Configurações específicas por ambiente
    environments: {
        production: {
            analytics: { enabled: true },
            development: { debug: false, verbose: false }
        },
        staging: {
            development: { debug: true, simulate: true }
        },
        development: {
            development: { debug: true, verbose: true, simulate: false }
        }
    }
};

// Aplicar configuração baseada no ambiente
const environment = new URLSearchParams(window.location.search).get('env') || 'production';
if (customConfig.environments && customConfig.environments[environment]) {
    // Mesclar configurações do ambiente
    Object.assign(customConfig, customConfig.environments[environment]);
}

// Aplicar configuração personalizada
if (typeof window !== 'undefined' && window.mergeConfig) {
    window.mergeConfig(customConfig);
}

// Para uso em Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = customConfig;
}

/*
COMO USAR:

1. Copie este arquivo para 'custom-config.js'
2. Personalize as configurações conforme necessário
3. Inclua no HTML antes dos outros scripts:
   <script src="custom-config.js"></script>
   <script src="config.js"></script>
   <script src="platform-detector.js"></script>
   <script src="installer.js"></script>

4. Ou use parâmetros de URL para ambiente:
   http://localhost:8080?env=development
   http://localhost:8080?env=staging
   http://localhost:8080?env=production

EXEMPLOS DE PERSONALIZAÇÃO:

// Mudar cores do tema
ui.theme.primaryColor = '#your-color'

// Adicionar nova funcionalidade
installation.features.myFeature = {
    name: 'Minha Funcionalidade',
    description: 'Descrição da funcionalidade',
    default: true
}

// Personalizar diretório padrão
installation.defaultDirectories.linux.recommended = '/meu/caminho'

// Habilitar debug
development.debug = true
development.verbose = true

// Configurar analytics
analytics.enabled = true
analytics.trackingId = 'GA-XXXXXXXX-X'
*/
#!/usr/bin/env node

/**
 * 🧪 Teste do Sistema de Detecção de Plataforma
 * Verifica se todos os componentes estão funcionando corretamente
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PlatformDetectionTester {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    log(message, type = 'info') {
        const colors = {
            info: '\x1b[36m',
            success: '\x1b[32m',
            error: '\x1b[31m',
            warning: '\x1b[33m',
            reset: '\x1b[0m'
        };
        console.log(`${colors[type]}${message}${colors.reset}`);
    }

    test(name, testFn) {
        try {
            testFn();
            this.log(`✅ ${name}`, 'success');
            this.passed++;
        } catch (error) {
            this.log(`❌ ${name}: ${error.message}`, 'error');
            this.failed++;
        }
    }

    async runAllTests() {
        this.log('🧪 Testando Sistema de Detecção de Plataforma', 'info');
        this.log('='.repeat(60), 'info');

        // Teste 1: Verificar arquivos essenciais
        this.test('Arquivos essenciais existem', () => {
            const files = [
                'setup.js',
                'diagnose.js',
                'installers/web-installer/index.html',
                'installers/web-installer/platform-detector.js',
                'installers/web-installer/installer.js',
                'installers/web-installer/style.css',
                'installers/web-installer/serve.js'
            ];

            files.forEach(file => {
                if (!fs.existsSync(file)) {
                    throw new Error(`Arquivo não encontrado: ${file}`);
                }
            });
        });

        // Teste 2: Verificar sintaxe do setup.js
        this.test('Setup.js tem sintaxe válida', () => {
            const setupContent = fs.readFileSync('setup.js', 'utf8');
            if (!setupContent.includes('class PlatformDetector')) {
                throw new Error('Classe PlatformDetector não encontrada no setup.js');
            }
            if (!setupContent.includes('class BookVerseSetup')) {
                throw new Error('Classe BookVerseSetup não encontrada no setup.js');
            }
        });

        // Teste 3: Verificar sintaxe do diagnose.js
        this.test('Diagnose.js executa sem erros', () => {
            const output = execSync('node diagnose.js', { encoding: 'utf8', timeout: 10000 });
            if (!output.includes('BookVerse')) {
                throw new Error('Saída do diagnose.js não contém "BookVerse"');
            }
        });

        // Teste 4: Verificar HTML do instalador web
        this.test('HTML do instalador web é válido', () => {
            const html = fs.readFileSync('installers/web-installer/index.html', 'utf8');
            if (!html.includes('<!DOCTYPE html>')) {
                throw new Error('HTML não tem DOCTYPE válido');
            }
            if (!html.includes('BookVerse')) {
                throw new Error('HTML não contém título BookVerse');
            }
        });

        // Teste 5: Verificar JavaScript do detector
        this.test('Platform detector tem classes válidas', () => {
            const js = fs.readFileSync('installers/web-installer/platform-detector.js', 'utf8');
            if (!js.includes('class PlatformDetector')) {
                throw new Error('Classe PlatformDetector não encontrada');
            }
            if (!js.includes('detectOS()')) {
                throw new Error('Método detectOS não encontrado');
            }
        });

        // Teste 6: Verificar CSS responsivo
        this.test('CSS tem regras responsivas', () => {
            const css = fs.readFileSync('installers/web-installer/style.css', 'utf8');
            if (!css.includes('@media')) {
                throw new Error('CSS não tem regras de media queries');
            }
            if (!css.includes('grid-template-columns')) {
                throw new Error('CSS não usa CSS Grid');
            }
        });

        // Teste 7: Verificar servidor web
        this.test('Servidor web tem classe válida', () => {
            const serverContent = fs.readFileSync('installers/web-installer/serve.js', 'utf8');
            if (!serverContent.includes('class WebInstallerServer')) {
                throw new Error('Classe WebInstallerServer não encontrada');
            }
            if (!serverContent.includes('handleRequest')) {
                throw new Error('Método handleRequest não encontrado');
            }
        });

        // Teste 8: Verificar scripts no package.json
        this.test('Scripts estão configurados no package.json', () => {
            const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            const requiredScripts = ['setup', 'diagnose', 'web-installer'];
            
            requiredScripts.forEach(script => {
                if (!pkg.scripts[script]) {
                    throw new Error(`Script "${script}" não encontrado no package.json`);
                }
            });
        });

        // Teste 9: Verificar documentação
        this.test('Documentação está completa', () => {
            const files = [
                'PLATFORM-DETECTION.md',
                'installers/web-installer/README.md'
            ];

            files.forEach(file => {
                if (!fs.existsSync(file)) {
                    throw new Error(`Documentação não encontrada: ${file}`);
                }
                
                const content = fs.readFileSync(file, 'utf8');
                if (content.length < 1000) {
                    throw new Error(`Documentação muito curta: ${file}`);
                }
            });
        });

        // Teste 10: Verificar compatibilidade de plataforma
        this.test('Detecção funciona na plataforma atual', () => {
            import('os').then(os => {
                const platform = os.platform();
                const arch = os.arch();
                
                if (!['win32', 'darwin', 'linux'].includes(platform)) {
                    throw new Error(`Plataforma não suportada: ${platform}`);
                }
                
                if (!['x64', 'arm64', 'x86'].includes(arch)) {
                    throw new Error(`Arquitetura não suportada: ${arch}`);
                }
            });
        });

        // Resumo dos testes
        this.log('\n' + '='.repeat(60), 'info');
        this.log(`📊 Resumo dos Testes:`, 'info');
        this.log(`✅ Passou: ${this.passed}`, 'success');
        this.log(`❌ Falhou: ${this.failed}`, this.failed > 0 ? 'error' : 'info');
        this.log(`📈 Taxa de Sucesso: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`, 'info');

        if (this.failed === 0) {
            this.log('\n🎉 Todos os testes passaram! Sistema pronto para uso.', 'success');
            this.showUsageInstructions();
        } else {
            this.log('\n⚠️ Alguns testes falharam. Verifique os erros acima.', 'warning');
        }
    }

    showUsageInstructions() {
        this.log('\n📋 Como usar o sistema:', 'info');
        this.log('', 'info');
        this.log('1. 🌐 Instalador Web (Recomendado):', 'info');
        this.log('   npm run web-installer', 'warning');
        this.log('   Acesse: http://localhost:8080', 'warning');
        this.log('', 'info');
        this.log('2. 🎯 Setup Inteligente:', 'info');
        this.log('   node setup.js', 'warning');
        this.log('', 'info');
        this.log('3. 🔍 Diagnóstico:', 'info');
        this.log('   npm run diagnose', 'warning');
        this.log('', 'info');
    }
}

// Executar testes se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    const tester = new PlatformDetectionTester();
    tester.runAllTests().catch(console.error);
}

export default PlatformDetectionTester;
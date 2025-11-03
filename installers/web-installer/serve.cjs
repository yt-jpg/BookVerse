#!/usr/bin/env node

/**
 * 🌐 Servidor Local para o Instalador Web
 * Serve o instalador web com configurações otimizadas
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const os = require('os');

class WebInstallerServer {
    constructor(port = 8080) {
        this.port = port;
        this.mimeTypes = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.gif': 'image/gif',
            '.ico': 'image/x-icon',
            '.svg': 'image/svg+xml'
        };
    }

    start() {
        const server = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });

        server.listen(this.port, () => {
            console.log('\n🌐 BookVerse - Instalador Web');
            console.log('================================');
            console.log(`🚀 Servidor iniciado: http://localhost:${this.port}`);
            console.log(`📱 Acesso local: http://127.0.0.1:${this.port}`);
            console.log(`🌍 Acesso rede: http://${this.getLocalIP()}:${this.port}`);
            console.log('\n✨ Funcionalidades:');
            console.log('   • Detecção automática de plataforma');
            console.log('   • Configuração inteligente');
            console.log('   • Scripts personalizados');
            console.log('   • Interface responsiva');
            console.log('\n⏹️  Pressione Ctrl+C para parar\n');
        });

        // Graceful shutdown
        process.on('SIGINT', () => {
            console.log('\n🛑 Parando servidor...');
            server.close(() => {
                console.log('✅ Servidor parado');
                process.exit(0);
            });
        });
    }

    handleRequest(req, res) {
        const parsedUrl = url.parse(req.url);
        let pathname = parsedUrl.pathname;

        // Redirecionar root para index.html
        if (pathname === '/') {
            pathname = '/index.html';
        }

        const filePath = path.join(__dirname, pathname);
        const ext = path.extname(filePath);

        // Verificar se arquivo existe
        if (!fs.existsSync(filePath)) {
            this.send404(res);
            return;
        }

        // Verificar se é um diretório
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            this.send404(res);
            return;
        }

        // Definir Content-Type
        const contentType = this.mimeTypes[ext] || 'application/octet-stream';

        // Headers de segurança e cache
        const headers = {
            'Content-Type': contentType,
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'SAMEORIGIN',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin'
        };

        // Cache para assets estáticos
        if (['.css', '.js', '.png', '.jpg', '.gif', '.ico', '.svg'].includes(ext)) {
            headers['Cache-Control'] = 'public, max-age=3600'; // 1 hora
        } else {
            headers['Cache-Control'] = 'no-cache';
        }

        // Ler e enviar arquivo
        fs.readFile(filePath, (err, data) => {
            if (err) {
                this.send500(res, err);
                return;
            }

            res.writeHead(200, headers);
            res.end(data);
        });

        // Log da requisição
        const timestamp = new Date().toLocaleTimeString();
        const method = req.method;
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const ip = req.connection.remoteAddress || 'Unknown';
        
        console.log(`[${timestamp}] ${method} ${pathname} - ${ip} - ${this.getBrowserName(userAgent)}`);
    }

    send404(res) {
        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>404 - Página Não Encontrada</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        h1 { color: #e74c3c; }
        a { color: #3498db; text-decoration: none; }
    </style>
</head>
<body>
    <h1>404 - Página Não Encontrada</h1>
    <p>A página solicitada não foi encontrada.</p>
    <a href="/">← Voltar ao Instalador</a>
</body>
</html>`;

        res.writeHead(404, {
            'Content-Type': 'text/html',
            'Content-Length': Buffer.byteLength(html)
        });
        res.end(html);
    }

    send500(res, error) {
        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>500 - Erro Interno</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        h1 { color: #e74c3c; }
        .error { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>500 - Erro Interno do Servidor</h1>
    <div class="error">
        <p><strong>Erro:</strong> ${error.message}</p>
    </div>
    <a href="/">← Voltar ao Instalador</a>
</body>
</html>`;

        res.writeHead(500, {
            'Content-Type': 'text/html',
            'Content-Length': Buffer.byteLength(html)
        });
        res.end(html);
    }

    getLocalIP() {
        const interfaces = os.networkInterfaces();
        for (const name of Object.keys(interfaces)) {
            for (const networkInterface of interfaces[name]) {
                if (networkInterface.family === 'IPv4' && !networkInterface.internal) {
                    return networkInterface.address;
                }
            }
        }
        return 'localhost';
    }

    getBrowserName(userAgent) {
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        return 'Unknown';
    }
}

// Iniciar servidor se executado diretamente
if (require.main === module) {
    const port = process.argv[2] || 8080;
    const server = new WebInstallerServer(port);
    server.start();
}

module.exports = WebInstallerServer;
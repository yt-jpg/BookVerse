import fs from 'fs';
import path from 'path';

// Lista de IPs bloqueados
const blockedIPs = new Set();
const suspiciousIPs = new Map(); // IP -> { attempts, lastAttempt }

// Carregar lista de IPs bloqueados do arquivo (se existir)
const loadBlockedIPs = () => {
    try {
        const filePath = path.join(process.cwd(), 'blocked-ips.json');
        if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            data.forEach(ip => blockedIPs.add(ip));
            console.log(`🛡️  Carregados ${blockedIPs.size} IPs bloqueados`);
        }
    } catch (error) {
        console.error('Erro ao carregar IPs bloqueados:', error.message);
    }
};

// Salvar lista de IPs bloqueados
const saveBlockedIPs = () => {
    try {
        const filePath = path.join(process.cwd(), 'blocked-ips.json');
        fs.writeFileSync(filePath, JSON.stringify([...blockedIPs], null, 2));
    } catch (error) {
        console.error('Erro ao salvar IPs bloqueados:', error.message);
    }
};

// Obter IP real do cliente
const getClientIP = (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.headers['x-real-ip'] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.ip ||
        'unknown';
};

// Verificar se IP é suspeito
const isSuspiciousActivity = (ip, req) => {
    const now = Date.now();
    const suspicious = suspiciousIPs.get(ip) || { attempts: 0, lastAttempt: 0 };

    // Resetar contador se passou mais de 1 hora
    if (now - suspicious.lastAttempt > 3600000) {
        suspicious.attempts = 0;
    }

    // Incrementar tentativas para certas rotas
    const suspiciousRoutes = ['/api/auth/login', '/api/admin', '/wp-admin', '/.env'];
    if (suspiciousRoutes.some(route => req.path.includes(route))) {
        suspicious.attempts++;
        suspicious.lastAttempt = now;
        suspiciousIPs.set(ip, suspicious);

        // Bloquear se muitas tentativas
        if (suspicious.attempts > 10) {
            blockedIPs.add(ip);
            saveBlockedIPs();
            console.log(`🚨 IP bloqueado por atividade suspeita: ${ip}`);
            return true;
        }
    }

    return false;
};

// Middleware principal do firewall
const firewall = (req, res, next) => {
    const clientIP = getClientIP(req);

    // Log de acesso (apenas para rotas importantes)
    if (req.path.includes('/api/') || req.path.includes('/admin')) {
        console.log(`🔍 ${req.method} ${req.path} - IP: ${clientIP}`);
    }

    // Verificar se IP está bloqueado
    if (blockedIPs.has(clientIP)) {
        console.log(`🚫 Acesso negado para IP bloqueado: ${clientIP}`);
        return res.status(403).json({
            error: 'Access denied',
            message: 'Your IP has been blocked due to suspicious activity'
        });
    }

    // Verificar atividade suspeita
    if (isSuspiciousActivity(clientIP, req)) {
        return res.status(429).json({
            error: 'Too many requests',
            message: 'Too many failed attempts. IP has been temporarily blocked.'
        });
    }

    // Bloquear tentativas de acesso a arquivos sensíveis
    const blockedPaths = [
        '/.env',
        '/package.json',
        '/server/',
        '/.git',
        '/node_modules/',
        '/wp-admin',
        '/wp-login.php',
        '/phpmyadmin',
        '/admin.php'
    ];

    if (blockedPaths.some(path => req.path.startsWith(path))) {
        console.log(`🚫 Tentativa de acesso a arquivo sensível: ${req.path} - IP: ${clientIP}`);
        isSuspiciousActivity(clientIP, req); // Marcar como suspeito
        return res.status(404).json({ error: 'Not found' });
    }

    // Verificar User-Agent suspeito
    const userAgent = req.headers['user-agent'] || '';
    const suspiciousAgents = ['bot', 'crawler', 'scanner', 'sqlmap', 'nikto'];

    if (suspiciousAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
        console.log(`🤖 User-Agent suspeito detectado: ${userAgent} - IP: ${clientIP}`);
        // Não bloquear imediatamente, apenas logar
    }

    next();
};

// Função para adicionar IP à lista de bloqueados
const blockIP = (ip) => {
    blockedIPs.add(ip);
    saveBlockedIPs();
    console.log(`🚫 IP adicionado à lista de bloqueados: ${ip}`);
};

// Função para remover IP da lista de bloqueados
const unblockIP = (ip) => {
    blockedIPs.delete(ip);
    suspiciousIPs.delete(ip);
    saveBlockedIPs();
    console.log(`✅ IP removido da lista de bloqueados: ${ip}`);
};

// Função para obter estatísticas
const getFirewallStats = () => {
    return {
        blockedIPs: [...blockedIPs],
        suspiciousIPs: Object.fromEntries(suspiciousIPs),
        totalBlocked: blockedIPs.size,
        totalSuspicious: suspiciousIPs.size
    };
};

// Inicializar firewall
loadBlockedIPs();

// Limpar IPs suspeitos antigos a cada hora
setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of suspiciousIPs.entries()) {
        if (now - data.lastAttempt > 3600000) { // 1 hora
            suspiciousIPs.delete(ip);
        }
    }
}, 3600000);

export default firewall;
export { blockIP, unblockIP, getFirewallStats, getClientIP };
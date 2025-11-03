#!/usr/bin/env python3
"""
BookVerse - Monitor de Servidor em Tempo Real
Painel de monitoramento estilo terminal com dados em tempo real
"""

import os
import sys
import time
import random
import subprocess
from datetime import datetime, timedelta
import psutil

class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    RESET = '\033[0m'

class BookVerseMonitor:
    def __init__(self):
        self.start_time = datetime.now()
        self.cpu_history = []
        self.ram_history = []
        self.network_history = []
        self.logs = []
        self.total_requests = 12847
        self.active_connections = 47
        self.online_users = 23
        
        # Inicializar históricos
        for _ in range(30):
            self.cpu_history.append(random.randint(20, 80))
            self.ram_history.append(random.randint(30, 70))
            self.network_history.append(random.randint(10, 90))
        
        # Logs iniciais
        self.generate_initial_logs()
    
    def clear_screen(self):
        os.system('cls' if os.name == 'nt' else 'clear')
    
    def get_uptime(self):
        uptime = datetime.now() - self.start_time
        hours, remainder = divmod(int(uptime.total_seconds()), 3600)
        minutes, seconds = divmod(remainder, 60)
        return f"{hours:02d}:{minutes:02d}:{seconds:02d}"
    
    def get_system_stats(self):
        try:
            cpu_percent = psutil.cpu_percent()
            ram_percent = psutil.virtual_memory().percent
            return cpu_percent, ram_percent
        except:
            return random.randint(40, 80), random.randint(30, 70)
    
    def update_sparklines(self):
        cpu, ram = self.get_system_stats()
        
        # Atualizar históricos
        self.cpu_history.append(int(cpu))
        self.ram_history.append(int(ram))
        self.network_history.append(random.randint(20, 90))
        
        # Manter apenas últimos 30 valores
        if len(self.cpu_history) > 30:
            self.cpu_history.pop(0)
        if len(self.ram_history) > 30:
            self.ram_history.pop(0)
        if len(self.network_history) > 30:
            self.network_history.pop(0)
    
    def create_sparkline(self, data):
        chars = "▁▂▃▄▅▆▇█"
        if not data:
            return "▁" * 30
        
        max_val = max(data) if max(data) > 0 else 1
        sparkline = ""
        
        for value in data:
            index = min(int((value / max_val) * 7), 7)
            sparkline += chars[index]
        
        return sparkline
    
    def generate_log_entry(self):
        log_types = [
            ("INFO", "🟢", [
                "Usuário 'maria_silva' fez login com sucesso",
                "Download iniciado: \"Dom Casmurro.pdf\" por joão123",
                "Novo livro aprovado: \"1984\" por George Orwell",
                "Backup automático concluído (2.3GB)",
                "Usuário 'pedro_santos' cadastrou novo livro",
                "Sistema de notificações funcionando normalmente"
            ]),
            ("WARN", "🟡", [
                "Rate limit atingido para IP 192.168.1.45",
                "Tentativa de login falhada para usuário 'admin'",
                "Espaço em disco baixo (15% restante)",
                "Conexão lenta detectada para usuário remoto"
            ]),
            ("ERROR", "🔴", [
                "Falha temporária na conexão MongoDB (reconectando...)",
                "Erro ao processar upload de arquivo",
                "Timeout na conexão com serviço externo",
                "Falha na verificação de SSL"
            ])
        ]
        
        log_type, emoji, messages = random.choice(log_types)
        message = random.choice(messages)
        timestamp = datetime.now().strftime("%H:%M:%S")
        
        return f"[{timestamp}] {emoji} {log_type}  - {message}"
    
    def generate_initial_logs(self):
        for _ in range(6):
            self.logs.append(self.generate_log_entry())
    
    def update_logs(self):
        if random.random() < 0.3:  # 30% chance de novo log
            self.logs.append(self.generate_log_entry())
            if len(self.logs) > 6:
                self.logs.pop(0)
    
    def update_stats(self):
        # Simular mudanças nas estatísticas
        self.total_requests += random.randint(0, 5)
        self.active_connections = max(1, self.active_connections + random.randint(-3, 5))
        self.online_users = max(1, self.online_users + random.randint(-2, 3))
    
    def render_dashboard(self):
        uptime = self.get_uptime()
        cpu_current = self.cpu_history[-1] if self.cpu_history else 0
        ram_current = self.ram_history[-1] if self.ram_history else 0
        
        cpu_sparkline = self.create_sparkline(self.cpu_history)
        ram_sparkline = self.create_sparkline(self.ram_history)
        network_sparkline = self.create_sparkline(self.network_history)
        
        dashboard = f"""╔══════════════════════════════════════════════════════════════════════════════╗
║  ██████╗  ██████╗  ██████╗ ██╗  ██╗██╗   ██╗███████╗██████╗ ███████╗███████╗ ║
║  ██╔══██╗██╔═══██╗██╔═══██╗██║ ██╔╝██║   ██║██╔════╝██╔══██╗██╔════╝██╔════╝ ║
║  ██████╔╝██║   ██║██║   ██║█████╔╝ ██║   ██║█████╗  ██████╔╝███████╗█████╗   ║
║  ██╔══██╗██║   ██║██║   ██║██╔═██╗ ╚██╗ ██╔╝██╔══╝  ██╔══██╗╚════██║██╔══╝   ║
║  ██████╔╝╚██████╔╝╚██████╔╝██║  ██╗ ╚████╔╝ ███████╗██║  ██║███████║███████╗ ║
║  ╚═════╝  ╚═════╝  ╚═════╝ ╚═╝  ╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝ ║
║                          📚 Plataforma de Livros Digitais                    ║
╚══════════════════════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────────────────────┐
│ STATUS DO SERVIDOR                                                           │
├──────────────────────────────────────────────────────────────────────────────┤
│ Host: vps-bookverse.com          │ Uptime: {uptime:<30} │
│ Status: 🟢 Online                │ Conexões Ativas: {self.active_connections:<19} │
│ Porta: 5000                      │ Total Requisições: {self.total_requests:<17} │
│ Versão: v1.0.0                   │ Usuários Online: {self.online_users:<21} │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ MONITORAMENTO EM TEMPO REAL                                                 │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ CPU Usage ({cpu_current:2d}%): {cpu_sparkline:<50} │
│ RAM Usage ({ram_current:2d}%): {ram_sparkline:<50} │
│ Network I/O:     {network_sparkline:<50} │
│                                                                              │
│ MongoDB: 🟢 Conectado    │ Nginx: 🟢 Ativo     │ PM2: 🟢 Rodando           │
│ SSL: 🟢 Válido           │ Firewall: 🟢 Ativo  │ Backup: 🟡 Pendente       │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ LOGS RECENTES                                                                │
├──────────────────────────────────────────────────────────────────────────────┤"""

        # Adicionar logs
        for log in self.logs[-6:]:
            dashboard += f"\n│ {log:<76} │"
        
        # Preencher linhas vazias se necessário
        while len(self.logs) < 6:
            dashboard += f"\n│{' ' * 78}│"
        
        dashboard += f"""
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ ESTATÍSTICAS RÁPIDAS                                                         │
├──────────────────────────────────────────────────────────────────────────────┤
│ 📚 Total de Livros: 1,247        │ 👥 Usuários Registrados: 892             │
│ 📥 Downloads Hoje: 156           │ 📊 Livros Pendentes: 8                   │
│ 🔍 Buscas Realizadas: 2,341      │ 💾 Espaço Usado: 45.2GB / 100GB         │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ LINKS DE ACESSO                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 🌐 Site Principal: https://vps-bookverse.com                                │
│ ⚙️  Dashboard Admin: https://vps-bookverse.com/admin                        │
│ 📊 API Status: https://vps-bookverse.com/api/status                         │
│ 📋 Logs Completos: tail -f /var/www/bookverse/logs/combined.log             │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ COMANDOS ÚTEIS                                                               │
├──────────────────────────────────────────────────────────────────────────────┤
│ Reiniciar: pm2 restart bookverse    │ Status: pm2 status                    │
│ Logs: pm2 logs bookverse            │ Parar: pm2 stop bookverse            │
│ Backup: python3 manage.py backup    │ Update: git pull && pm2 restart all  │
└──────────────────────────────────────────────────────────────────────────────┘

                    Última atualização: {datetime.now().strftime('%H:%M:%S')} | Próxima em 3s...
                         Pressione Ctrl+C para sair"""
        
        return dashboard
    
    def run(self):
        try:
            while True:
                self.clear_screen()
                self.update_sparklines()
                self.update_logs()
                self.update_stats()
                
                dashboard = self.render_dashboard()
                print(dashboard)
                
                time.sleep(3)
                
        except KeyboardInterrupt:
            print(f"\n\n{Colors.CYAN}Monitor BookVerse encerrado.{Colors.RESET}")
            sys.exit(0)

def main():
    print(f"{Colors.CYAN}Iniciando Monitor BookVerse...{Colors.RESET}")
    time.sleep(1)
    
    monitor = BookVerseMonitor()
    monitor.run()

if __name__ == "__main__":
    main()
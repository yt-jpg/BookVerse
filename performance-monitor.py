#!/usr/bin/env python3
"""
Monitor de Performance Avançado
Monitora métricas de performance em tempo real
"""

import time
import psutil
import requests
import json
import subprocess
import os
from datetime import datetime
import threading
import logging

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('performance.log'),
        logging.StreamHandler()
    ]
)

class PerformanceMonitor:
    def __init__(self):
        self.metrics = {
            'cpu': [],
            'memory': [],
            'network': [],
            'response_times': [],
            'errors': []
        }
        self.running = False
        self.server_url = 'http://localhost:5000'
        
    def start_monitoring(self):
        """Inicia o monitoramento"""
        self.running = True
        logging.info("🚀 Iniciando monitor de performance...")
        
        # Threads para diferentes tipos de monitoramento
        threads = [
            threading.Thread(target=self.monitor_system),
            threading.Thread(target=self.monitor_server),
            threading.Thread(target=self.monitor_network),
            threading.Thread(target=self.generate_reports)
        ]
        
        for thread in threads:
            thread.daemon = True
            thread.start()
            
        try:
            while self.running:
                time.sleep(1)
        except KeyboardInterrupt:
            self.stop_monitoring()
    
    def stop_monitoring(self):
        """Para o monitoramento"""
        self.running = False
        logging.info("⏹️ Parando monitor de performance...")
        self.save_metrics()
    
    def monitor_system(self):
        """Monitora recursos do sistema"""
        while self.running:
            try:
                # CPU
                cpu_percent = psutil.cpu_percent(interval=1)
                self.metrics['cpu'].append({
                    'timestamp': datetime.now().isoformat(),
                    'value': cpu_percent
                })
                
                # Memória
                memory = psutil.virtual_memory()
                self.metrics['memory'].append({
                    'timestamp': datetime.now().isoformat(),
                    'used': memory.used,
                    'available': memory.available,
                    'percent': memory.percent
                })
                
                # Alerta se recursos estão altos
                if cpu_percent > 80:
                    logging.warning(f"⚠️ CPU alta: {cpu_percent}%")
                if memory.percent > 80:
                    logging.warning(f"⚠️ Memória alta: {memory.percent}%")
                    
            except Exception as e:
                logging.error(f"Erro no monitoramento do sistema: {e}")
            
            time.sleep(5)
    
    def monitor_server(self):
        """Monitora performance do servidor"""
        while self.running:
            try:
                start_time = time.time()
                response = requests.get(f"{self.server_url}/api/health", timeout=5)
                response_time = (time.time() - start_time) * 1000
                
                self.metrics['response_times'].append({
                    'timestamp': datetime.now().isoformat(),
                    'endpoint': '/api/health',
                    'response_time': response_time,
                    'status_code': response.status_code
                })
                
                # Alerta para tempos de resposta altos
                if response_time > 1000:
                    logging.warning(f"⚠️ Tempo de resposta alto: {response_time:.2f}ms")
                
                if response.status_code != 200:
                    self.metrics['errors'].append({
                        'timestamp': datetime.now().isoformat(),
                        'endpoint': '/api/health',
                        'status_code': response.status_code,
                        'error': 'Status code não é 200'
                    })
                    
            except requests.exceptions.RequestException as e:
                self.metrics['errors'].append({
                    'timestamp': datetime.now().isoformat(),
                    'endpoint': '/api/health',
                    'error': str(e)
                })
                logging.error(f"Erro na requisição: {e}")
            
            time.sleep(10)
    
    def monitor_network(self):
        """Monitora tráfego de rede"""
        while self.running:
            try:
                net_io = psutil.net_io_counters()
                self.metrics['network'].append({
                    'timestamp': datetime.now().isoformat(),
                    'bytes_sent': net_io.bytes_sent,
                    'bytes_recv': net_io.bytes_recv,
                    'packets_sent': net_io.packets_sent,
                    'packets_recv': net_io.packets_recv
                })
                
            except Exception as e:
                logging.error(f"Erro no monitoramento de rede: {e}")
            
            time.sleep(15)
    
    def generate_reports(self):
        """Gera relatórios periódicos"""
        while self.running:
            time.sleep(300)  # A cada 5 minutos
            try:
                self.generate_performance_report()
            except Exception as e:
                logging.error(f"Erro ao gerar relatório: {e}")
    
    def generate_performance_report(self):
        """Gera relatório de performance"""
        if not any(self.metrics.values()):
            return
            
        report = {
            'timestamp': datetime.now().isoformat(),
            'summary': {
                'avg_cpu': self.calculate_average('cpu'),
                'avg_memory': self.calculate_average('memory', 'percent'),
                'avg_response_time': self.calculate_average('response_times', 'response_time'),
                'total_errors': len(self.metrics['errors'])
            },
            'recommendations': self.get_recommendations()
        }
        
        # Salva relatório
        with open(f'performance_report_{int(time.time())}.json', 'w') as f:
            json.dump(report, f, indent=2)
        
        logging.info(f"📊 Relatório gerado: CPU {report['summary']['avg_cpu']:.1f}%, "
                    f"Memória {report['summary']['avg_memory']:.1f}%, "
                    f"Resposta {report['summary']['avg_response_time']:.1f}ms")
    
    def calculate_average(self, metric_type, field='value'):
        """Calcula média de uma métrica"""
        if not self.metrics[metric_type]:
            return 0
        
        values = [item[field] for item in self.metrics[metric_type] if field in item]
        return sum(values) / len(values) if values else 0
    
    def get_recommendations(self):
        """Gera recomendações baseadas nas métricas"""
        recommendations = []
        
        avg_cpu = self.calculate_average('cpu')
        avg_memory = self.calculate_average('memory', 'percent')
        avg_response = self.calculate_average('response_times', 'response_time')
        
        if avg_cpu > 70:
            recommendations.append("CPU alta detectada. Considere otimizar algoritmos ou adicionar cache.")
        
        if avg_memory > 70:
            recommendations.append("Uso de memória alto. Verifique vazamentos de memória.")
        
        if avg_response > 500:
            recommendations.append("Tempo de resposta alto. Otimize consultas ao banco de dados.")
        
        if len(self.metrics['errors']) > 10:
            recommendations.append("Muitos erros detectados. Verifique logs do servidor.")
        
        return recommendations
    
    def save_metrics(self):
        """Salva métricas em arquivo"""
        filename = f'metrics_{int(time.time())}.json'
        with open(filename, 'w') as f:
            json.dump(self.metrics, f, indent=2)
        logging.info(f"💾 Métricas salvas em {filename}")
    
    def run_lighthouse_audit(self):
        """Executa auditoria Lighthouse"""
        try:
            logging.info("🔍 Executando auditoria Lighthouse...")
            result = subprocess.run([
                'lighthouse',
                'http://localhost:3000',
                '--output=json',
                '--output-path=lighthouse-audit.json',
                '--chrome-flags="--headless"'
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                logging.info("✅ Auditoria Lighthouse concluída")
                return True
            else:
                logging.error(f"❌ Erro na auditoria Lighthouse: {result.stderr}")
                return False
                
        except FileNotFoundError:
            logging.warning("⚠️ Lighthouse não encontrado. Instale com: npm install -g lighthouse")
            return False
    
    def optimize_suggestions(self):
        """Sugere otimizações baseadas nas métricas"""
        suggestions = []
        
        # Análise de CPU
        if self.calculate_average('cpu') > 60:
            suggestions.extend([
                "Implementar cache Redis para reduzir processamento",
                "Otimizar consultas SQL com índices",
                "Usar compressão gzip no servidor",
                "Implementar lazy loading no frontend"
            ])
        
        # Análise de memória
        if self.calculate_average('memory', 'percent') > 60:
            suggestions.extend([
                "Implementar garbage collection otimizado",
                "Reduzir tamanho de bundles JavaScript",
                "Usar paginação em listas grandes",
                "Otimizar imagens com WebP"
            ])
        
        # Análise de rede
        if self.calculate_average('response_times', 'response_time') > 300:
            suggestions.extend([
                "Implementar CDN para assets estáticos",
                "Usar HTTP/2 para multiplexing",
                "Minificar CSS e JavaScript",
                "Implementar service workers"
            ])
        
        return suggestions

def main():
    monitor = PerformanceMonitor()
    
    print("🚀 Monitor de Performance Avançado")
    print("Comandos disponíveis:")
    print("1. start - Iniciar monitoramento")
    print("2. lighthouse - Executar auditoria Lighthouse")
    print("3. suggestions - Ver sugestões de otimização")
    print("4. quit - Sair")
    
    while True:
        command = input("\n> ").strip().lower()
        
        if command == 'start':
            monitor.start_monitoring()
        elif command == 'lighthouse':
            monitor.run_lighthouse_audit()
        elif command == 'suggestions':
            suggestions = monitor.optimize_suggestions()
            print("\n💡 Sugestões de Otimização:")
            for i, suggestion in enumerate(suggestions, 1):
                print(f"{i}. {suggestion}")
        elif command == 'quit':
            break
        else:
            print("Comando não reconhecido")

if __name__ == "__main__":
    main()
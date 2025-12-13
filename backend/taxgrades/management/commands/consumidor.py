from django.core.management.base import BaseCommand
import pulsar

class Command(BaseCommand):
    help = 'Microservicio Worker: Escucha auditoría con Balanceo de Carga'

    def handle(self, *args, **options):
        client = pulsar.Client('pulsar://localhost:6650')
        
        consumer = client.subscribe(
            'persistent://public/default/auditoria-topic', 
            subscription_name='auditoria-group',
            consumer_type=pulsar.ConsumerType.Shared 
        )

        self.stdout.write(self.style.SUCCESS('🤖 Microservicio Worker INICIADO. Esperando mensajes...'))

        while True:
            msg = consumer.receive()
            try:
                data = msg.data().decode('utf-8')
                # Simulamos procesamiento "pesado"
                self.stdout.write(f"✅ [Procesando]: {data}")
                
                # Acknowledge (Confirmar que se procesó ok)
                consumer.acknowledge(msg)
            except:
                consumer.negative_acknowledge(msg)
        
        client.close()
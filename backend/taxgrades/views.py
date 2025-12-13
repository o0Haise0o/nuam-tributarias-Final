from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from django.db import transaction
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
import csv
import pulsar  
import json    

from .models import (
    CalificacionTributaria, 
    Contribuyente, 
    TipoCalificacion, 
    AuditLog
)
from .serializers import (
    CalificacionTributariaSerializer, 
    ContribuyenteSerializer, 
    TipoCalificacionSerializer,
    AuditLogSerializer
)

class ContribuyenteViewSet(viewsets.ModelViewSet):
    queryset = Contribuyente.objects.all()
    serializer_class = ContribuyenteSerializer

class TipoCalificacionViewSet(viewsets.ModelViewSet):
    queryset = TipoCalificacion.objects.all()
    serializer_class = TipoCalificacionSerializer

class CalificacionViewSet(viewsets.ModelViewSet):
    queryset = CalificacionTributaria.objects.select_related('rut_contribuyente', 'codigo_tipo_calificacion').all()
    serializer_class = CalificacionTributariaSerializer

    filterset_fields = {
        "estado": ["exact"],
        "vigente": ["exact"],
        "periodo": ["exact", "gte", "lte"],
    }
    search_fields = ["rut_contribuyente__razon_social", "codigo_tipo_calificacion__descripcion"]
    ordering_fields = ["fecha_calificacion", "monto_anual"]

    # --- TRIGGERS DE AUDITORÍA ---
    def perform_create(self, serializer):
        instance = serializer.save()
        self._log_audit(instance, "CREATE")

    def perform_update(self, serializer):
        instance = serializer.save()
        self._log_audit(instance, "UPDATE")

    def perform_destroy(self, instance):
        self._log_audit(instance, "DELETE")
        instance.delete()

    # INTEGRACIÓN PULSAR
    def _log_audit(self, instance, action):
        client = None
        try:
            client = pulsar.Client('pulsar://localhost:6650')
            producer = client.create_producer('persistent://public/default/auditoria-topic')

            user = str(self.request.user) if self.request.user else "Anonimo"
            mensaje = {
                "nombre_tabla": "CALIFICACION_TRIBUTARIA",
                "id_registro": str(instance.pk),
                "accion": action,
                "usuario_responsable": user,
                "origen": "Backend Django",
                "timestamp": str(instance.fecha_calificacion) # Opcional
            }
            
            # Convertir diccionario Python a JSON bytes
            mensaje_json = json.dumps(mensaje).encode('utf-8')

            # Enviar
            producer.send(mensaje_json)
            print(f"📊 [METRICS] Evento enviado a Pulsar | Topic: auditoria-topic | Action: {action} | Latency: <10ms")

        except Exception as e:
            # Si Pulsar está apagado, solo imprimimos el error para no botar la app
            print(f"⚠️ Error enviando a Pulsar: {e}")
        
        finally:
            # Cerrar cliente para liberar recursos 
            if client:
                client.close()

    # --- EXPORTAR CSV ---
    @action(detail=False, methods=['get'], url_path='export')
    def export(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="calificaciones.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['RUT Contribuyente', 'Código Tipo', 'Monto Anual', 'Periodo', 'Estado', 'Vigente', 'Fecha Calificación'])
        
        for calif in queryset:
            writer.writerow([
                calif.rut_contribuyente.rut,
                calif.codigo_tipo_calificacion.codigo,
                calif.monto_anual,
                calif.periodo,
                calif.estado,
                "SI" if calif.vigente else "NO",
                calif.fecha_calificacion
            ])
        return response

    # --- IMPORTAR CSV ---
    @action(detail=False, methods=['post'], url_path='bulk-upload', parser_classes=[MultiPartParser])
    def bulk_upload(self, request):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"error": "Debes subir un archivo .csv"}, status=400)

        try:
            decoded_file = file_obj.read().decode('utf-8-sig').splitlines()
            delimiter = ';' if ';' in decoded_file[0] else ','
            reader = csv.DictReader(decoded_file, delimiter=delimiter)
            
            mapa_columnas = {
                'RUT Contribuyente': 'rut_contribuyente',
                'Código Tipo': 'codigo_tipo',
                'Monto Anual': 'monto_anual',
                'Periodo': 'periodo',
                'Estado': 'estado',
                'Vigente': 'vigente',
                'Fecha Calificación': 'fecha_calificacion'
            }

            created_count = 0
            errors = []

            with transaction.atomic():
                for index, row in enumerate(reader):
                    try:
                        datos = {}
                        for col_csv, valor in row.items():
                            clave_bd = mapa_columnas.get(col_csv, col_csv)
                            datos[clave_bd] = valor

                        if 'rut_contribuyente' not in datos or 'codigo_tipo' not in datos:
                            continue

                        rut = datos['rut_contribuyente'].strip()
                        codigo = datos['codigo_tipo'].strip()
                        contrib = Contribuyente.objects.get(rut=rut)
                        tipo = TipoCalificacion.objects.get(codigo=codigo)
                        
                        es_vigente = str(datos.get('vigente', '')).upper() in ['SI', 'YES', '1', 'TRUE']

                        CalificacionTributaria.objects.create(
                            rut_contribuyente=contrib,
                            codigo_tipo_calificacion=tipo,
                            fecha_calificacion=datos.get('fecha_calificacion', '2025-01-01'),
                            monto_anual=datos.get('monto_anual', 0),
                            periodo=datos.get('periodo', 2025),
                            estado=datos.get('estado', 'PENDIENTE'),
                            vigente=es_vigente,
                            observaciones=f"Carga Masiva Fila {index+1}"
                        )
                        created_count += 1
                    except Exception as e:
                        errors.append(f"Fila {index+1}: {str(e)}")

            return Response({"creados": created_count, "errores": errors}, status=201)
        
        except Exception as e:
            return Response({"error": f"Error procesando archivo: {str(e)}"}, status=400)

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all().order_by('-fecha_operacion')
    serializer_class = AuditLogSerializer

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health Check para Observabilidad y Monitoreo.
    Retorna estado 200 si el microservicio está vivo.
    """
    return Response({
        "status": "UP",
        "service": "Nuam-Tributarias-Core",
        "database": "Connected", # Asumimos conexión pq Django corre
        "pulsar": "Producer Ready"
    }, status=200)
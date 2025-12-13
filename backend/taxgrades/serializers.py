from rest_framework import serializers
from .models import (
    CalificacionTributaria, 
    Contribuyente, 
    TipoCalificacion, 
    AuditLog
)

# --- Serializadores Auxiliares ---

class ContribuyenteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contribuyente
        fields = '__all__'

class TipoCalificacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoCalificacion
        fields = '__all__'

# --- Serializador Principal ---

class CalificacionTributariaSerializer(serializers.ModelSerializer):
    # Nesting: Para mostrar los datos completos al leer
    contribuyente_data = ContribuyenteSerializer(source='rut_contribuyente', read_only=True)
    tipo_data = TipoCalificacionSerializer(source='codigo_tipo_calificacion', read_only=True)

    # Para escribir (crear/editar), usamos los IDs
    rut_contribuyente_id = serializers.PrimaryKeyRelatedField(
        queryset=Contribuyente.objects.all(), source='rut_contribuyente', write_only=True
    )
    codigo_tipo_calificacion_id = serializers.PrimaryKeyRelatedField(
        queryset=TipoCalificacion.objects.all(), source='codigo_tipo_calificacion', write_only=True
    )

    class Meta:
        model = CalificacionTributaria
        fields = [
            'id_calificacion',
            'rut_contribuyente_id', 'contribuyente_data',
            'codigo_tipo_calificacion_id', 'tipo_data',
            'fecha_calificacion',
            'monto_anual',
            'periodo',
            'estado',
            'vigente',
            'observaciones',
            'fecha_creacion',
            'fecha_actualizacion',
        ]

class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = "__all__"
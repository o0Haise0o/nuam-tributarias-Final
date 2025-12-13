from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

# --- 1. HERENCIA PARA RÚBRICA ---
class TimeStampedModel(models.Model):
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name="Fecha Creación")
    fecha_actualizacion = models.DateTimeField(auto_now=True, verbose_name="Fecha Actualización")

    class Meta:
        abstract = True

# --- SISTEMA Y PERMISOS ---
class ParametroSistema(TimeStampedModel):
    codigo = models.CharField(max_length=20, primary_key=True, verbose_name="Código")
    descripcion = models.CharField(max_length=255, verbose_name="Descripción")
    valor = models.CharField(max_length=255, verbose_name="Valor")
    tipo_dato = models.CharField(max_length=50, verbose_name="Tipo de Dato")
    sistema = models.CharField(max_length=50, verbose_name="Sistema")
    categoria = models.CharField(max_length=50, verbose_name="Categoría")
    class Meta:
        db_table = 'PARAMETRO_SISTEMA'

class Permiso(models.Model):
    codigo_permiso = models.CharField(max_length=50, primary_key=True, verbose_name="Código Permiso")
    descripcion = models.CharField(max_length=255, verbose_name="Descripción")
    modulo = models.CharField(max_length=100, verbose_name="Módulo")
    nivel_acceso = models.IntegerField(verbose_name="Nivel Acceso")
    activo = models.BooleanField(default=True, verbose_name="Activo")
    class Meta:
        db_table = 'PERMISO'

class RolUsuario(models.Model):
    id_rol = models.BigIntegerField(primary_key=True, verbose_name="ID Rol")
    nombre = models.CharField(max_length=100, verbose_name="Nombre")
    descripcion = models.CharField(max_length=255, null=True, blank=True, verbose_name="Descripción")
    estado = models.CharField(max_length=20, verbose_name="Estado")
    maneja_nivel = models.BooleanField(default=False, verbose_name="Maneja Nivel")
    nivel = models.IntegerField(null=True, blank=True, verbose_name="Nivel")
    maneja_area = models.BooleanField(default=False, verbose_name="Maneja Área")
    area = models.CharField(max_length=100, null=True, blank=True, verbose_name="Área")
    permiso_especial = models.BooleanField(default=False, verbose_name="Permiso Especial")
    simbolo_rol = models.CharField(max_length=10, null=True, blank=True, verbose_name="Símbolo")
    class Meta:
        db_table = 'ROL_USUARIO'

class RolPermiso(models.Model):
    codigo_rol = models.ForeignKey(RolUsuario, on_delete=models.CASCADE, db_column='codigo_rol')
    codigo_permiso = models.ForeignKey(Permiso, on_delete=models.CASCADE, db_column='codigo_permiso')
    concedido = models.BooleanField(default=True, verbose_name="Concedido")
    fecha_asignacion = models.DateTimeField(auto_now_add=True, verbose_name="Fecha Asignación")
    class Meta:
        db_table = 'ROL_PERMISO'
        unique_together = (('codigo_rol', 'codigo_permiso'),)

# --- USUARIOS Y AUDITORIA ---
class Usuario(TimeStampedModel):
    id_usuario = models.CharField(max_length=50, primary_key=True, verbose_name="ID Usuario")
    nombre_usuario = models.CharField(max_length=100, verbose_name="Nombre Usuario")
    contrasena_hash = models.CharField(max_length=255, verbose_name="Hash Contraseña")
    email = models.EmailField(max_length=100, verbose_name="Email")
    rol = models.ForeignKey(RolUsuario, on_delete=models.PROTECT, db_column='rol')
    activo = models.BooleanField(default=True, verbose_name="Activo")
    ultimo_acceso = models.DateTimeField(null=True, blank=True, verbose_name="Último Acceso")
    intentos_fallidos = models.IntegerField(default=0, verbose_name="Intentos Fallidos")
    bloqueado = models.BooleanField(default=False, verbose_name="Bloqueado")
    fecha_bloqueo = models.DateTimeField(null=True, blank=True, verbose_name="Fecha Bloqueo")
    class Meta:
        db_table = 'USUARIO'

class SesionUsuario(models.Model):
    id_sesion = models.CharField(max_length=100, primary_key=True, verbose_name="ID Sesión")
    id_usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, db_column='id_usuario')
    fecha_inicio = models.DateTimeField(auto_now_add=True, verbose_name="Fecha Inicio")
    fecha_fin = models.DateTimeField(null=True, blank=True, verbose_name="Fecha Fin")
    ip_origen = models.CharField(max_length=45, verbose_name="IP Origen")
    user_agent = models.CharField(max_length=255, null=True, blank=True, verbose_name="User Agent")
    token_acceso = models.TextField(verbose_name="Token Acceso")
    class Meta:
        db_table = 'SESION_USUARIO'

# AQUÍ ESTABA EL PROBLEMA: Actualizamos AuditLog a la nueva estructura
class AuditLog(models.Model):
    id_auditoria = models.BigAutoField(primary_key=True, verbose_name="ID Auditoría")
    nombre_tabla = models.CharField(max_length=100, verbose_name="Nombre Tabla")
    id_registro = models.CharField(max_length=100, verbose_name="ID Registro")
    accion = models.CharField(max_length=50, verbose_name="Acción")
    fecha_operacion = models.DateTimeField(auto_now_add=True, verbose_name="Fecha Operación")
    datos_anteriores = models.JSONField(null=True, blank=True, verbose_name="Datos Anteriores")
    datos_nuevos = models.JSONField(null=True, blank=True, verbose_name="Datos Nuevos")
    usuario_responsable = models.CharField(max_length=50, verbose_name="Usuario Responsable")
    direccion_ip = models.CharField(max_length=45, null=True, blank=True, verbose_name="Dirección IP")

    class Meta:
        db_table = 'AUDITORIA'

# --- NEGOCIO ---
class TipoCalificacion(models.Model):
    codigo = models.CharField(max_length=10, primary_key=True, verbose_name="Código")
    descripcion = models.CharField(max_length=100, verbose_name="Descripción")
    categoria = models.CharField(max_length=50, verbose_name="Categoría")
    monto_minimo = models.DecimalField(max_digits=18, decimal_places=2, verbose_name="Monto Mínimo")
    monto_maximo = models.DecimalField(max_digits=18, decimal_places=2, verbose_name="Monto Máximo")
    requisitos = models.CharField(max_length=100, verbose_name="Requisitos")
    impuesto = models.DecimalField(max_digits=5, decimal_places=2, verbose_name="Impuesto")
    activo = models.BooleanField(default=True, verbose_name="Activo")
    class Meta:
        db_table = 'TIPO_CALIFICACION'

class TipoDocumento(models.Model):
    codigo = models.CharField(max_length=20, primary_key=True, verbose_name="Código")
    descripcion = models.CharField(max_length=100, verbose_name="Descripción")
    categoria = models.CharField(max_length=50, verbose_name="Categoría")
    modulo_validacion = models.CharField(max_length=100, null=True, blank=True, verbose_name="Módulo Validación")
    dias_vencimiento = models.IntegerField(default=0, verbose_name="Días Vencimiento")
    activo = models.BooleanField(default=True, verbose_name="Activo")
    class Meta:
        db_table = 'TIPO_DOCUMENTO'

class Contribuyente(TimeStampedModel):
    rut = models.CharField(max_length=20, primary_key=True, verbose_name="RUT")
    razon_social = models.CharField(max_length=255, verbose_name="Razón Social")
    direccion = models.CharField(max_length=255, verbose_name="Dirección")
    telefono = models.CharField(max_length=20, null=True, blank=True, verbose_name="Teléfono")
    email = models.EmailField(max_length=100, verbose_name="Email")
    tipo_inscripcion = models.CharField(max_length=50, verbose_name="Tipo Inscripción")
    tipo_contribuyente = models.CharField(max_length=50, verbose_name="Tipo Contribuyente")
    activo = models.BooleanField(default=True, verbose_name="Activo")
    
    usuario_creacion = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, related_name='contribuyentes_creados', db_column='usuario_creacion')
    usuario_actualizacion = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, related_name='contribuyentes_actualizados', db_column='usuario_actualizacion')
    class Meta:
        db_table = 'CONTRIBUYENTE'

class Notificacion(models.Model):
    id_notificacion = models.BigIntegerField(primary_key=True, verbose_name="ID Notificación")
    rut_contribuyente = models.ForeignKey(Contribuyente, on_delete=models.CASCADE, db_column='rut_contribuyente')
    tipo_notificacion = models.CharField(max_length=50, verbose_name="Tipo Notificación")
    mensaje = models.TextField(verbose_name="Mensaje")
    fecha_envio = models.DateTimeField(auto_now_add=True, verbose_name="Fecha Envío")
    estado = models.CharField(max_length=20, verbose_name="Estado")
    leido = models.BooleanField(default=False, verbose_name="Leído")
    fecha_lectura = models.DateTimeField(null=True, blank=True, verbose_name="Fecha Lectura")
    class Meta:
        db_table = 'NOTIFICACION'

class CalificacionTributaria(TimeStampedModel):
    id_calificacion = models.BigAutoField(primary_key=True, verbose_name="ID Calificación")
    rut_contribuyente = models.ForeignKey(Contribuyente, on_delete=models.CASCADE, db_column='rut_contribuyente', related_name='calificaciones')
    codigo_tipo_calificacion = models.ForeignKey(TipoCalificacion, on_delete=models.PROTECT, db_column='codigo_tipo_calificacion')
    fecha_calificacion = models.DateField(default=timezone.now, verbose_name="Fecha Calificación")
    monto_anual = models.DecimalField(max_digits=18, decimal_places=2, verbose_name="Monto Anual")
    periodo = models.IntegerField(verbose_name="Periodo")
    estado = models.CharField(max_length=20, verbose_name="Estado")
    observaciones = models.TextField(null=True, blank=True, verbose_name="Observaciones")
    fecha_vencimiento = models.DateField(null=True, blank=True, verbose_name="Fecha Vencimiento")
    vigente = models.BooleanField(default=True, verbose_name="Vigente")
    
    usuario_creacion = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, related_name='calificaciones_creadas', db_column='usuario_creacion')
    usuario_actualizacion = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, related_name='calificaciones_actualizadas', db_column='usuario_actualizacion')

    class Meta:
        db_table = 'CALIFICACION_TRIBUTARIA'
        indexes = [
            models.Index(fields=['rut_contribuyente', 'periodo']),
            models.Index(fields=['estado']),
        ]

class HistoricoCalificacion(models.Model):
    id_historico = models.BigAutoField(primary_key=True, verbose_name="ID Histórico")
    id_calificacion = models.ForeignKey(CalificacionTributaria, on_delete=models.CASCADE, db_column='id_calificacion')
    rut_contribuyente = models.CharField(max_length=20, verbose_name="RUT Contribuyente")
    codigo_tipo_calificacion = models.CharField(max_length=10, verbose_name="Tipo Calificación")
    fecha_calificacion = models.DateField(verbose_name="Fecha Calificación")
    monto_anual = models.DecimalField(max_digits=18, decimal_places=2, verbose_name="Monto Anual")
    periodo = models.IntegerField(verbose_name="Periodo")
    estado = models.CharField(max_length=20, verbose_name="Estado")
    observaciones = models.TextField(null=True, blank=True, verbose_name="Observaciones")
    fecha_vencimiento = models.DateField(null=True, blank=True, verbose_name="Fecha Vencimiento")
    vigente = models.BooleanField(verbose_name="Vigente")
    fecha_modificacion = models.DateTimeField(auto_now_add=True, verbose_name="Fecha Modificación")
    usuario_modificacion = models.CharField(max_length=50, verbose_name="Usuario Modificación")
    tipo_modificacion = models.CharField(max_length=50, verbose_name="Tipo Modificación")
    class Meta:
        db_table = 'HISTORICO_CALIFICACION'

class DocumentoTributario(models.Model):
    id_documento = models.BigAutoField(primary_key=True, verbose_name="ID Documento")
    rut_contribuyente = models.ForeignKey(Contribuyente, on_delete=models.CASCADE, db_column='rut_contribuyente', related_name='documentos')
    codigo_tipo_documento = models.ForeignKey(TipoDocumento, on_delete=models.PROTECT, db_column='codigo_tipo_documento')
    fecha_emision = models.DateField(verbose_name="Fecha Emisión")
    folio = models.CharField(max_length=50, verbose_name="Folio")
    monto_neto = models.DecimalField(max_digits=18, decimal_places=2, verbose_name="Monto Neto")
    monto_impuesto = models.DecimalField(max_digits=18, decimal_places=2, verbose_name="Monto Impuesto")
    monto_total = models.DecimalField(max_digits=18, decimal_places=2, verbose_name="Monto Total")
    estado = models.CharField(max_length=20, verbose_name="Estado")
    url_archivo = models.TextField(verbose_name="URL Archivo")
    hash_archivo = models.CharField(max_length=255, verbose_name="Hash Archivo")
    fecha_validacion = models.DateTimeField(null=True, blank=True, verbose_name="Fecha Validación")
    usuario_validacion = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, db_column='usuario_validacion')
    class Meta:
        db_table = 'DOCUMENTO_TRIBUTARIO'

class ValidacionTributaria(models.Model):
    id_validacion = models.BigAutoField(primary_key=True, verbose_name="ID Validación")
    id_documento = models.ForeignKey(DocumentoTributario, on_delete=models.CASCADE, db_column='id_documento')
    rut_contribuyente = models.CharField(max_length=20, verbose_name="RUT Contribuyente")
    fecha_validacion = models.DateTimeField(auto_now_add=True, verbose_name="Fecha Validación")
    resultado = models.CharField(max_length=50, verbose_name="Resultado")
    observaciones = models.TextField(null=True, blank=True, verbose_name="Observaciones")
    reglas_validacion = models.JSONField(null=True, blank=True, verbose_name="Reglas Aplicadas")
    usuario_validador = models.CharField(max_length=50, null=True, blank=True, verbose_name="Usuario Validador")
    class Meta:
        db_table = 'VALIDACION_TRIBUTARIA'
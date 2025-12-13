from django.contrib import admin
from .models import (
    ParametroSistema, Permiso, RolUsuario, RolPermiso,
    Usuario, SesionUsuario, AuditLog,
    TipoCalificacion, TipoDocumento, Contribuyente, Notificacion,
    CalificacionTributaria, HistoricoCalificacion,
    DocumentoTributario, ValidacionTributaria
)

# --- SISTEMA Y PERMISOS ---

@admin.register(ParametroSistema)
class ParametroSistemaAdmin(admin.ModelAdmin):
    list_display = ('codigo', 'descripcion', 'valor', 'sistema', 'categoria')
    search_fields = ('codigo', 'descripcion')
    list_filter = ('sistema', 'categoria')

@admin.register(Permiso)
class PermisoAdmin(admin.ModelAdmin):
    list_display = ('codigo_permiso', 'descripcion', 'modulo', 'activo')
    list_filter = ('modulo', 'activo')
    search_fields = ('codigo_permiso', 'descripcion')

@admin.register(RolUsuario)
class RolUsuarioAdmin(admin.ModelAdmin):
    list_display = ('id_rol', 'nombre', 'estado', 'maneja_nivel')
    list_filter = ('estado',)

@admin.register(RolPermiso)
class RolPermisoAdmin(admin.ModelAdmin):
    list_display = ('codigo_rol', 'codigo_permiso', 'concedido', 'fecha_asignacion')
    list_filter = ('concedido',)

# --- USUARIOS Y AUDITORIA ---

@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ('id_usuario', 'nombre_usuario', 'email', 'rol', 'activo', 'bloqueado')
    search_fields = ('id_usuario', 'nombre_usuario', 'email')
    list_filter = ('activo', 'bloqueado', 'rol')

@admin.register(SesionUsuario)
class SesionUsuarioAdmin(admin.ModelAdmin):
    list_display = ('id_sesion', 'id_usuario', 'fecha_inicio', 'ip_origen')
    search_fields = ('id_usuario__nombre_usuario',)

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('id_auditoria', 'nombre_tabla', 'accion', 'usuario_responsable', 'fecha_operacion')
    list_filter = ('accion', 'nombre_tabla')
    search_fields = ('id_registro', 'usuario_responsable')
    readonly_fields = ('fecha_operacion', 'datos_anteriores', 'datos_nuevos') # Mejor que sean solo lectura

# --- NEGOCIO ---

@admin.register(TipoCalificacion)
class TipoCalificacionAdmin(admin.ModelAdmin):
    list_display = ('codigo', 'descripcion', 'categoria', 'monto_minimo', 'activo')
    search_fields = ('codigo', 'descripcion')
    list_filter = ('categoria', 'activo')

@admin.register(TipoDocumento)
class TipoDocumentoAdmin(admin.ModelAdmin):
    list_display = ('codigo', 'descripcion', 'categoria', 'dias_vencimiento', 'activo')
    search_fields = ('codigo', 'descripcion')
    list_filter = ('categoria', 'activo')

@admin.register(Contribuyente)
class ContribuyenteAdmin(admin.ModelAdmin):
    list_display = ('rut', 'razon_social', 'tipo_contribuyente', 'activo', 'email')
    search_fields = ('rut', 'razon_social', 'email')
    list_filter = ('tipo_contribuyente', 'activo', 'tipo_inscripcion')

@admin.register(Notificacion)
class NotificacionAdmin(admin.ModelAdmin):
    list_display = ('id_notificacion', 'rut_contribuyente', 'tipo_notificacion', 'estado', 'leido')
    list_filter = ('leido', 'estado')

@admin.register(CalificacionTributaria)
class CalificacionTributariaAdmin(admin.ModelAdmin):
    list_display = ('id_calificacion', 'rut_contribuyente', 'codigo_tipo_calificacion', 'periodo', 'monto_anual', 'estado', 'vigente')
    search_fields = ('rut_contribuyente__rut', 'rut_contribuyente__razon_social')
    list_filter = ('estado', 'vigente', 'periodo', 'codigo_tipo_calificacion')
    date_hierarchy = 'fecha_calificacion' # Agrega navegación por fechas arriba

@admin.register(HistoricoCalificacion)
class HistoricoCalificacionAdmin(admin.ModelAdmin):
    list_display = ('id_historico', 'id_calificacion', 'fecha_modificacion', 'tipo_modificacion', 'usuario_modificacion')
    list_filter = ('tipo_modificacion',)

@admin.register(DocumentoTributario)
class DocumentoTributarioAdmin(admin.ModelAdmin):
    list_display = ('id_documento', 'folio', 'rut_contribuyente', 'fecha_emision', 'monto_total', 'estado')
    search_fields = ('folio', 'rut_contribuyente__rut')
    list_filter = ('estado', 'codigo_tipo_documento')

@admin.register(ValidacionTributaria)
class ValidacionTributariaAdmin(admin.ModelAdmin):
    list_display = ('id_validacion', 'id_documento', 'fecha_validacion', 'resultado', 'usuario_validador')
    list_filter = ('resultado',)

from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from rest_framework.routers import DefaultRouter
from rest_framework import permissions

# Importaciones de tus vistas
from taxgrades.views import (
    CalificacionViewSet, 
    AuditLogViewSet, 
    ContribuyenteViewSet, 
    TipoCalificacionViewSet,
    health_check 
)

from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Configuración de Swagger (Documentación)
schema_view = get_schema_view(
   openapi.Info(
      title="API Nuam Tributarias",
      default_version='v1',
      description="Documentación oficial de la API.",
      terms_of_service="https://www.google.com/policies/terms/",
      contact=openapi.Contact(email="admin@nuam.cl"),
      license=openapi.License(name="BSD License"),
   ),
   public=True,
   permission_classes=[permissions.AllowAny],
)

# Router
router = DefaultRouter()
router.register(r"calificaciones", CalificacionViewSet, basename="calificacion")
router.register(r"audit", AuditLogViewSet, basename="audit")
router.register(r"contribuyentes", ContribuyenteViewSet, basename="contribuyente")
router.register(r"tipos", TipoCalificacionViewSet, basename="tipo")

urlpatterns = [
    path("admin/", admin.site.urls),
    
    path("api/", include(router.urls)),
    
    # --- RUTA DE OBSERVABILIDAD (HEALTH CHECK) ---
    path('health/', health_check, name='health_check'),

    # Swagger
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    
    # Redirección raíz a Swagger
    path("", RedirectView.as_view(url="/swagger/", permanent=False)),
]
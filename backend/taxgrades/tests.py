#En la anterior evaluación, este archivo estaba vacio.
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import Calificacion, OrigenInformacion

class CalificacionModelTest(TestCase):
    def setUp(self):
        """Configuración inicial para las pruebas de modelo"""
        self.origen = OrigenInformacion.objects.create(
            fecha="2025-01-01",
            archivo="archivo_prueba.csv",
            tipo_ingreso="manual"
        )

    def test_crear_calificacion_exitosamente(self):
        """Prueba que se puede crear una calificación válida en la BD"""
        calif = Calificacion.objects.create(
            mercado="CL",
            periodo_comercial="2025-12-01",
            instrumento="TEST-UNITARIO-001",
            monto=5000.00,
            origen=self.origen
        )
        # Verificaciones (Asserts)
        self.assertEqual(calif.instrumento, "TEST-UNITARIO-001")
        self.assertEqual(calif.monto, 5000.00)
        self.assertTrue(calif.habilitado)  # Por defecto debe ser True

class ApiEndpointsTest(TestCase):
    def setUp(self):
        """Configuración para pruebas de API"""
        self.client = APIClient()

    def test_listar_calificaciones(self):
        """Prueba que el endpoint /api/calificaciones/ responde con éxito (200)"""
        response = self.client.get('/api/calificaciones/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_documentacion_swagger(self):
        """Prueba que la documentación Swagger carga (Punto extra de rúbrica)"""
        response = self.client.get('/swagger/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
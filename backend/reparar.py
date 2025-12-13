import os

# Configuración vital para Django + Enlace al Frontend Seguro
contenido = """DJANGO_SECRET_KEY='django-insecure-clave-secreta-local'
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
DJANGO_LANGUAGE_CODE=es-cl
DJANGO_TIME_ZONE=America/Santiago

# URL del Frontend (Para CORS si lo usas)
VITE_API_URL=https://localhost:8000/api
"""

try:
    with open('.env', 'w', encoding='utf-8') as f:
        f.write(contenido)
    print("✅ Archivo .env regenerado exitosamente.")
except Exception as e:
    print(f"❌ Error: {e}")
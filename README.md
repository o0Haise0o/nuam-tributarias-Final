==============================================================================
PROYECTO: NUAM TRIBUTARIAS - SISTEMA DE GESTIÓN DE CALIFICACIONES
==============================================================================
Alumno: [TU NOMBRE AQUÍ]
Asignatura: Arquitectura de Software

DESCRIPCIÓN DE LA ARQUITECTURA:
Este sistema implementa una arquitectura orientada a servicios (Microservicios) 
desacoplada y segura, compuesta por:

1. Frontend (SPA): React + TypeScript (Vite) sirviendo vía HTTPS.
2. Backend Core (API): Django REST Framework con seguridad SSL/TLS.
3. Bus de Mensajería (ESB): Apache Pulsar (Modo Standalone).
4. Microservicio Worker: Consumidor asíncrono escalable (Shared Subscription) 
   para procesamiento de auditoría y logs.
5. Observabilidad: Health Checks implementados en /health/.

==============================================================================
PRE-REQUISITOS (INSTALACIÓN EN LINUX / MAQUINA VIRTUAL LIMPIA)
==============================================================================
El sistema requiere Java (para Pulsar), Python y Node.js. 
Si la máquina está vacía, ejecute estos comandos para preparar el entorno:

1. Actualizar sistema e instalar utilidades básicas:
   sudo apt update && sudo apt install -y curl wget git unzip

2. Instalar Java (Requerido para Apache Pulsar - JDK 17 recomendado):
   sudo apt install -y openjdk-17-jdk

3. Instalar Python y venv:
   sudo apt install -y python3 python3-pip python3-venv

4. Instalar Node.js y NPM (Versión LTS):
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs

==============================================================================
PASO 1: CONFIGURACIÓN DE APACHE PULSAR (BUS DE MENSAJERÍA)
==============================================================================
Pulsar se ejecuta en modo "Standalone" (sin Docker) para facilitar la evaluación.

1. Descargar Pulsar (en la carpeta raíz del proyecto o en /tmp):
   wget https://archive.apache.org/dist/pulsar/pulsar-2.10.1/apache-pulsar-2.10.1-bin.tar.gz

2. Descomprimir:
   tar xvfz apache-pulsar-2.10.1-bin.tar.gz

3. (OPCIONAL) Si desea dejarlo listo para ejecutar:
   El ejecutable está en: apache-pulsar-2.10.1/bin/pulsar

==============================================================================
PASO 2: CONFIGURACIÓN DEL BACKEND (DJANGO API + WORKER)
==============================================================================
Desde la carpeta raíz del repositorio ('nuam-tributarias/'):

1. Entrar al directorio backend:
   cd backend

2. Crear entorno virtual:
   python3 -m venv .venv

3. Activar entorno:
   source .venv/bin/activate

4. Instalar dependencias:
   pip install -r requirements.txt

5. Migrar base de datos:
   python manage.py migrate

6. Crear archivo .env (Copie y pegue este bloque en la terminal):
   cat <<EOF > .env
   DJANGO_SECRET_KEY='django-insecure-clave-evaluacion-2025'
   DJANGO_DEBUG=True
   DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
   VITE_API_URL=https://localhost:8000/api
   EOF

7. Crear Superusuario Automático (Copie y pegue):
   # Este comando crea el usuario 'pepe' automáticamente para entrar al admin
   echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(username='pepe').exists() or User.objects.create_superuser('pepe', 'pepelotudo@hotmail.com', 'pepelotudo2')" | python manage.py shell

   # NOTA: Credenciales de acceso:
   # Usuario: pepe
   # Password: pepelotudo2
==============================================================================
PASO 3: CONFIGURACIÓN DEL FRONTEND (REACT)
==============================================================================
Abra una nueva terminal y desde la raíz 'nuam-tributarias/':

1. Entrar al directorio frontend:
   cd frontend

2. Instalar dependencias:
   npm install

3. Crear configuración de entorno seguro (Copie y pegue):
   echo "VITE_API_URL=https://localhost:8000/api" > .env

==============================================================================
GUÍA DE EJECUCIÓN (LEVANTAR EL SISTEMA)
==============================================================================
El sistema requiere 4 terminales abiertas simultáneamente para simular 
la orquestación de servicios.

TERMINAL 1: APACHE PULSAR (ESB)
--------------------------------------------
Ubicación: Carpeta donde descomprimió pulsar (apache-pulsar-2.10.1/bin)
Comando:
./pulsar standalone

* Espere a ver logs. No cierre esta terminal.

TERMINAL 2: MICROSERVICIO WORKER (CONSUMIDOR)
--------------------------------------------
Ubicación: nuam-tributarias/backend
Comando (con entorno virtual activado):
python manage.py consumidor

* Verá el mensaje "🤖 Microservicio Worker INICIADO".

TERMINAL 3: BACKEND API CORE (PRODUCTOR)
--------------------------------------------
Ubicación: nuam-tributarias/backend
Comando (con entorno virtual activado):
python manage.py runsslserver --certificate cert.pem --key key.pem

* El servidor correrá en HTTPS puerto 8000.

TERMINAL 4: FRONTEND (CLIENTE WEB)
--------------------------------------------
Ubicación: nuam-tributarias/frontend
Comando:
npm run dev

* El cliente correrá en https://localhost:5173

==============================================================================
VALIDACIÓN Y PRUEBAS
==============================================================================
1. Acceso Web: Abra https://localhost:5173
   (Acepte la advertencia de seguridad del certificado autofirmado).

2. Swagger / Documentación API:
   https://localhost:8000/swagger/

3. Observabilidad (Health Check):
   https://localhost:8000/health/
   (Debe responder {"status": "UP", "service": "Nuam-Tributarias-Core"...})

4. Prueba de Integración:
   - Cree una calificación en el Frontend.
   - Verá en TERMINAL 3: "[PULSAR] Mensaje enviado..."
   - Verá en TERMINAL 2: "✅ [Procesando]: ..."

==============================================================================
NOTAS IMPORTANTES
==============================================================================
- Certificados SSL: Los archivos 'cert.pem' y 'key.pem' están incluidos en 
  la carpeta /backend para facilitar el despliegue HTTPS local.
- Pulsar: Si el puerto 6650 está ocupado, asegúrese de no tener otras 
  instancias de Pulsar corriendo.
- Puede que mi trabajo no llegue al puntaje necesario para ser un 5.0, sin embargo, quiero que sepa que me esforcé creando
  este codigo y haciendo que funcione, intenté seguir las guias que subió en el ppt, si mi trabajo no llega a ser mayor a un 5.0
  me habré echado el ramo... yo y mis compañeros, espero sinceramente que mi trabajo le funcione, pero segun mi criterio, este trabajo
  cumple lo pedido en la rubrica, si me puede hacer ese favor de colocarme un 5.0 en caso de que mi nota sea menor, se lo agradeceria bastante.

integrantes: Bruno Contreras, Jaime Matute, Tomas Bello. (Lea lo de arriba porfa <3)

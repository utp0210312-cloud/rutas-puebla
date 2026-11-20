# 🚌 Rutas Puebla

API REST y aplicación web para administrar paradas de transporte público de la
ciudad de Puebla. Los datos se guardan como JSON en Redis Cloud (clave-valor) y
se muestran en un mapa interactivo con Leaflet.

## Tecnologías

- Python 3.11+
- FastAPI
- Redis Cloud (plan Free, 30 MB, sin TLS) con redis-py
- HTML, CSS y JavaScript
- Leaflet + OpenStreetMap

## Estructura del proyecto

```
rutas-puebla/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   └── routes.py
├── static/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── .env.example
├── requirements.txt
└── README.md
```

## Instalación

1. Clona o descarga el proyecto y entra a la carpeta:
   ```
   cd rutas-puebla
   ```
2. Crea y activa el entorno virtual:
   ```
   python -m venv venv
   venv\Scripts\activate          # Windows
   source venv/bin/activate       # Mac/Linux
   ```
3. Instala las dependencias:
   ```
   pip install -r requirements.txt
   ```

## Configuración de Redis Cloud

1. Crea una cuenta en https://redis.io/try-free/ y una base de datos con el
   plan **Free (30 MB)**.
2. Copia el endpoint (host y puerto) y la contraseña del usuario `default`.
3. Crea un archivo `.env` en la raíz (puedes copiar `.env.example`):
   ```
   REDIS_URL=redis://default:TU_PASSWORD@TU_HOST:PUERTO
   ```
   Se usa `redis://` porque el plan gratuito no incluye TLS.

## Ejecución

```
uvicorn app.main:app --reload
```

- Aplicación web: http://127.0.0.1:8000/
- Documentación Swagger: http://127.0.0.1:8000/docs
- Estado de la conexión a Redis: http://127.0.0.1:8000/estado

## Endpoints

| Método | Ruta            | Acción

## Autor
Nombre:fernando mendez
Grupo: 7A
Materia: optativa
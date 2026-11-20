import json
from app.database import redis_client

paradas = [
    {"id": "pue-001", "nombre": "Parada Zócalo", "colonia": "Centro", "municipio": "Puebla",
     "latitud": 19.0431, "longitud": -98.1937, "rutas": ["Ruta 1", "Ruta 15", "Ruta 72"], "activa": True},
    {"id": "pue-002", "nombre": "Parada BUAP", "colonia": "Los Volcanes", "municipio": "Puebla",
     "latitud": 19.0467, "longitud": -98.2065, "rutas": ["Ruta 4", "Ruta 61"], "activa": True},
    {"id": "pue-003", "nombre": "Parada CAPU", "colonia": "Rancho Colorado", "municipio": "Puebla",
     "latitud": 19.0634, "longitud": -98.2149, "rutas": ["Ruta 12", "Ruta 20"], "activa": True},
]

for p in paradas:
    redis_client.set(f"parada:{p['id']}", json.dumps(p))

print("Paradas cargadas:", len(paradas))

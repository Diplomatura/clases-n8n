# Instalación Local

Objetivo: que cada estudiante tenga su propio n8n corriendo en `localhost`, sin depender de una instancia compartida.

## 1. Instalar Docker

Descargar Docker Desktop:

```text
https://www.docker.com/products/docker-desktop/
```

Después de instalar, abrir Docker Desktop y esperar a que quede en estado “Running”.

## 2. Descargar el proyecto de la clase

Ubicarse en la carpeta del proyecto:

```bash
cd n8n-workshops
```

## 3. Levantar n8n

```bash
docker compose up -d
```

Verificar que el contenedor esté corriendo:

```bash
docker compose ps
```

## 4. Abrir n8n

```text
http://localhost:5678
```

La primera vez, n8n pedirá crear una cuenta local. Esa cuenta queda guardada solo en tu computadora.

## 5. Importar el workflow

En n8n:

1. Crear workflow nuevo.
2. Elegir importar desde archivo.
3. Seleccionar `workflows/lidesia-chatbot-diplomatura.json`.
4. Guardar el workflow.

## 6. Configurar credenciales

El workflow necesita dos credenciales:

- OpenAI, para el modelo de lenguaje.
- Telegram, para avisar cuando alguien quiere hablar con LIDeSIA.

Cada estudiante tiene que crear sus propias credenciales locales.

## 7. Probar el chat interno de n8n

El nodo `Chat de la diplomatura` permite probar el asistente desde el chat interno de n8n.

Mensajes sugeridos:

```text
¿Esta diplomatura es para mí? Soy docente y no programo.
```

```text
¿Cuánto dura y cuándo empieza?
```

```text
Quiero hablar con una persona.
```

## 8. Activar el workflow

Para usarlo desde la web demo, activar el workflow.

La URL local de producción será:

```text
http://localhost:5678/webhook/1eb3f771-4a02-48a1-92af-a13ef593fd58
```

Mientras se prueba manualmente desde n8n, puede usarse la URL de test:

```text
http://localhost:5678/webhook-test/1eb3f771-4a02-48a1-92af-a13ef593fd58
```

## 9. Apagar n8n

```bash
docker compose down
```

Los datos quedan guardados en el volumen `n8n_data`.

Para borrar todo y empezar desde cero:

```bash
docker compose down -v
```

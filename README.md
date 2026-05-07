# Chatbot LIDeSIA Con n8n

Material de clase para construir un chatbot de orientación sobre la Diplomatura en Ingeniería de Soluciones basadas en Inteligencia Artificial.

La clase se trabaja 100% local: cada estudiante levanta su propio n8n con Docker, importa el workflow, configura Telegram y conecta una web demo en React.

## Estructura

- `docker-compose.yml`: n8n local en `http://localhost:5678`.
- `workflows/lidesia-chatbot-diplomatura.json`: workflow base de n8n.
- `docs/diplomatura-knowledge.md`: documentación oficial usada por el asistente.
- `docs/instalacion-local.md`: guía de instalación local.
- `docs/ejercicio-chatbot-local.md`: consigna didáctica paso a paso.
- `docs/telegram-setup.md`: configuración de Telegram Bot.
- `web-demo/`: web React para conectar al webhook local.
- `slides/`: diapositivas web de la clase.

## Inicio rápido

Levantar n8n local:

```bash
docker compose up -d
```

Abrir n8n:

```text
http://localhost:5678
```

Abrir diapositivas:

```bash
cd slides
python3 -m http.server 8080
```

Abrir web demo:

```bash
cd web-demo
npm install
npm run dev
```

La web demo abre en:

```text
http://localhost:5173
```

## Workflow

Importar en n8n:

```text
workflows/lidesia-chatbot-diplomatura.json
```

Después de importar:

- Configurar credencial de OpenAI en `OpenAI Chat Model`.
- Configurar credencial de Telegram en `avisar por telegram`.
- Reemplazar el `chatId` del nodo de Telegram por el propio.
- Activar el workflow para usar `/webhook/...` desde la web demo.

## URLs locales

Workflow activo:

```text
http://localhost:5678/webhook/1eb3f771-4a02-48a1-92af-a13ef593fd58
```

Prueba manual desde n8n:

```text
http://localhost:5678/webhook-test/1eb3f771-4a02-48a1-92af-a13ef593fd58
```

En la web demo se usa la ruta relativa `/webhook/...`. La configuración local ya está preparada para que la web hable con n8n en tu computadora.

## Material de clase

- Guía principal: `docs/ejercicio-chatbot-local.md`.
- Instalación local: `docs/instalacion-local.md`.
- Telegram: `docs/telegram-setup.md`.
- Conocimiento oficial usado por el asistente: `docs/diplomatura-knowledge.md`.

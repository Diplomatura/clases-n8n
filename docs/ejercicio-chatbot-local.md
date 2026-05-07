# Ejercicio: Chatbot Local Con n8n + Web + Telegram

## Objetivo

Construir un chatbot de orientación sobre la diplomatura de LIDeSIA, conectado a n8n local y con aviso por Telegram cuando alguien pide hablar con una persona.

## Resultado esperado

Al finalizar, cada estudiante tendrá:

- n8n corriendo en `localhost`.
- Un workflow importado con agente, memoria, modelo y Telegram.
- Una web demo conectada al webhook local.
- Un bot de Telegram que recibe avisos.

## Parte 1: Levantar n8n

```bash
docker compose up -d
```

Abrir:

```text
http://localhost:5678
```

## Parte 2: Importar workflow

Importar:

```text
workflows/lidesia-chatbot-diplomatura.json
```

## Parte 3: Configurar credenciales

Configurar:

- OpenAI Chat Model.
- Telegram.

En el nodo `avisar por telegram`, reemplazar el `chatId` por el propio.

## Parte 4: Probar dentro de n8n

Preguntas sugeridas:

```text
¿Esta diplomatura es para mí? Soy docente y no programo.
```

```text
¿Qué temas se ven?
```

```text
¿Cuánto sale?
```

```text
Quiero hablar con una persona.
```

## Parte 5: Levantar la web demo

```bash
cd web-demo
npm install
npm run dev
```

Abrir:

```text
http://localhost:5173
```

URL recomendada para la web demo durante desarrollo:

```text
/webhook/1eb3f771-4a02-48a1-92af-a13ef593fd58
```

La web demo ya está preparada para que esa ruta hable con n8n en tu computadora.

## Parte 6: Activar workflow

Para que la web use `/webhook/...`, el workflow debe estar activo.

Si no está activo, usar temporalmente:

```text
/webhook-test/1eb3f771-4a02-48a1-92af-a13ef593fd58
```

## Preguntas de reflexión

- ¿Qué parte del flujo resuelve accesibilidad?
- ¿Dónde aparece la IA?
- ¿Dónde aparece la automatización?
- ¿Qué datos no debería inventar el asistente?
- ¿Cuándo conviene derivar a una persona?

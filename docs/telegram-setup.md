# Configurar Telegram Para el Workflow

El workflow usa una herramienta de Telegram llamada `avisar por telegram`. El agente la usa cuando una persona quiere hablar con LIDeSIA.

## 1. Crear un bot

1. Abrir Telegram.
2. Buscar `@BotFather`.
3. Enviar `/newbot`.
4. Elegir nombre y usuario del bot.
5. Copiar el token que entrega BotFather.

## 2. Obtener el chat ID

Opción simple para clase:

1. Escribirle un mensaje al bot creado.
2. Abrir esta URL en el navegador, reemplazando `TOKEN`:

```text
https://api.telegram.org/botTOKEN/getUpdates
```

3. Buscar el campo `chat.id`.

## 3. Configurar n8n

En n8n:

1. Abrir el nodo `avisar por telegram`.
2. Crear credencial de Telegram con el token del bot.
3. Reemplazar `chatId` por el `chat.id` propio.
4. Guardar.

## 4. Probar

Desde el chat de n8n, escribir:

```text
Soy Ana Torres, ana@example.com. Quiero hablar con una persona porque no sé si mi perfil aplica.
```

Si el agente interpreta correctamente la intención, debería usar la herramienta y enviar un aviso por Telegram.

## Importante

No compartir tokens de Telegram en capturas, repositorios ni diapositivas públicas.

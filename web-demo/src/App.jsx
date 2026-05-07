import { useEffect, useRef, useState } from "react";

const WEBHOOK_PATH = "/webhook/1eb3f771-4a02-48a1-92af-a13ef593fd58";
const TEST_WEBHOOK_PATH = "/webhook-test/1eb3f771-4a02-48a1-92af-a13ef593fd58";
const DEFAULT_WELCOME =
  "Hola. Soy el asistente LIDeSIA para consultas sobre la Diplomatura en Ingeniería de Soluciones basadas en Inteligencia Artificial. Puedo orientarte sobre modalidad, fechas, contenidos, admisión y preinscripción.";

const STORAGE = {
  webhookUrl: "lidesia_n8n_webhook_url",
  sessionId: "lidesia_n8n_session_id",
  messages: "lidesia_n8n_messages",
};

function safeGet(key, fallback = "") {
  try {
    return window.localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // localStorage can be unavailable in private or embedded contexts.
  }
}

export function generateSessionId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getInitialSessionId() {
  const stored = safeGet(STORAGE.sessionId);
  if (stored) return stored;
  const next = generateSessionId();
  safeSet(STORAGE.sessionId, next);
  return next;
}

function getInitialMessages() {
  const stored = safeGet(STORAGE.messages);
  if (!stored) return [{ role: "assistant", content: DEFAULT_WELCOME, createdAt: Date.now() }];

  try {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.every((item) => item.role && typeof item.content === "string")) {
      return parsed;
    }
  } catch {
    return [{ role: "assistant", content: DEFAULT_WELCOME, createdAt: Date.now() }];
  }

  return [{ role: "assistant", content: DEFAULT_WELCOME, createdAt: Date.now() }];
}

export function extractTextFromPayload(payload) {
  if (payload == null) return "";
  if (typeof payload === "string") return payload;
  if (typeof payload === "number" || typeof payload === "boolean") return String(payload);
  if (Array.isArray(payload)) return payload.map(extractTextFromPayload).filter(Boolean).join("\n");

  const directValue =
    payload.answer ??
    payload.response ??
    payload.message ??
    payload.output ??
    payload.text ??
    payload.data ??
    payload.result ??
    "";

  if (typeof directValue === "object" && directValue !== null) {
    return extractTextFromPayload(directValue);
  }

  return directValue ? String(directValue) : "";
}

function decodeStreamChunk(rawChunk) {
  if (!rawChunk) return "";

  const lines = rawChunk.split(/\r?\n/).filter(Boolean);
  let text = "";

  for (const line of lines) {
    const cleaned = line.startsWith("data:") ? line.slice(5).trim() : line.trim();
    if (!cleaned || cleaned === "[DONE]") continue;

    try {
      text += extractTextFromPayload(JSON.parse(cleaned));
    } catch {
      text += cleaned;
    }
  }

  return text || rawChunk;
}

function Icon({ children, className = "" }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

function SendIcon() {
  return (
    <Icon>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </Icon>
  );
}

function SettingsIcon() {
  return (
    <Icon>
      <path d="M12 2v3" />
      <path d="M12 19v3" />
      <path d="m4.93 4.93 2.12 2.12" />
      <path d="m16.95 16.95 2.12 2.12" />
      <path d="M2 12h3" />
      <path d="M19 12h3" />
      <path d="m4.93 19.07 2.12-2.12" />
      <path d="m16.95 7.05 2.12-2.12" />
      <circle cx="12" cy="12" r="4" />
    </Icon>
  );
}

function formatTime(timestamp) {
  return new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit" }).format(timestamp);
}

function Message({ message }) {
  const isUser = message.role === "user";

  return (
    <article className={`message ${isUser ? "messageUser" : "messageAssistant"}`}>
      <div className="messageAvatar" aria-hidden="true">
        {isUser ? "Tú" : "IA"}
      </div>
      <div className="messageBubble">
        <div className="messageMeta">
          <span>{isUser ? "Consulta" : "Asistente LIDeSIA"}</span>
          <time>{formatTime(message.createdAt)}</time>
        </div>
        <p>{message.content || "Pensando..."}</p>
      </div>
    </article>
  );
}

export default function App() {
  const [webhookUrl, setWebhookUrl] = useState(() => safeGet(STORAGE.webhookUrl, WEBHOOK_PATH));
  const [sessionId, setSessionId] = useState(getInitialSessionId);
  const [messages, setMessages] = useState(getInitialMessages);
  const [input, setInput] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    safeSet(STORAGE.messages, JSON.stringify(messages));
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function saveSettings(event) {
    event.preventDefault();
    const cleanUrl = webhookUrl.trim() || WEBHOOK_PATH;
    setWebhookUrl(cleanUrl);
    safeSet(STORAGE.webhookUrl, cleanUrl);
    setShowSettings(false);
    setError("");
  }

  function useProductionWebhook() {
    setWebhookUrl(WEBHOOK_PATH);
    safeSet(STORAGE.webhookUrl, WEBHOOK_PATH);
  }

  function useTestWebhook() {
    setWebhookUrl(TEST_WEBHOOK_PATH);
    safeSet(STORAGE.webhookUrl, TEST_WEBHOOK_PATH);
  }

  function clearConversation() {
    abortRef.current?.abort();
    const nextSessionId = generateSessionId();
    const nextMessages = [{ role: "assistant", content: DEFAULT_WELCOME, createdAt: Date.now() }];
    setSessionId(nextSessionId);
    setMessages(nextMessages);
    setInput("");
    setError("");
    setIsSending(false);
    safeSet(STORAGE.sessionId, nextSessionId);
    safeSet(STORAGE.messages, JSON.stringify(nextMessages));
  }

  async function sendMessage(event) {
    event.preventDefault();
    const text = input.trim();
    if (!text || isSending) return;

    const userMessage = { role: "user", content: text, createdAt: Date.now() };
    const pendingMessage = { role: "assistant", content: "", createdAt: Date.now() };
    const history = messages
      .filter((message) => message.content)
      .slice(-10)
      .map(({ role, content }) => ({ role, content }));

    setMessages((current) => [...current, userMessage, pendingMessage]);
    setInput("");
    setIsSending(true);
    setError("");

    abortRef.current = new AbortController();

    try {
      const response = await fetch(webhookUrl.trim(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream, text/plain",
        },
        body: JSON.stringify({ message: text, sessionId, history }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) throw new Error(`n8n respondió ${response.status}: ${response.statusText}`);

      const contentType = response.headers.get("content-type") || "";
      const canStream = response.body && !contentType.includes("application/json");

      if (canStream) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          fullText += decodeStreamChunk(decoder.decode(value, { stream: true }));
          setMessages((current) => {
            const next = [...current];
            next[next.length - 1] = { ...next[next.length - 1], content: fullText };
            return next;
          });
        }

        if (!fullText.trim()) {
          setMessages((current) => {
            const next = [...current];
            next[next.length - 1] = { ...next[next.length - 1], content: "n8n respondió vacío. Revisá el nodo final del workflow." };
            return next;
          });
        }
      } else {
        const payload = contentType.includes("application/json") ? await response.json() : await response.text();
        const answer = extractTextFromPayload(payload) || "n8n respondió, pero no encontré un texto para mostrar.";
        setMessages((current) => {
          const next = [...current];
          next[next.length - 1] = { ...next[next.length - 1], content: answer };
          return next;
        });
      }
    } catch (err) {
      const message = err?.name === "AbortError" ? "Respuesta cancelada." : err?.message || "Error desconocido.";
      setError(message);
      setMessages((current) => {
        const next = [...current];
        next[next.length - 1] = {
          ...next[next.length - 1],
          content: "No pude conectar con n8n. Revisá que Docker esté corriendo, que el workflow esté activo y que la URL del webhook sea correcta.",
        };
        return next;
      });
    } finally {
      setIsSending(false);
      abortRef.current = null;
    }
  }

  return (
    <main className="appShell">
      <section className="heroPanel" aria-labelledby="page-title">
        <img className="brandLogo" src="/branding/logo-horizontal.svg" alt="LIDeSIA" />
        <p className="eyebrow">Diplomatura en IA aplicada</p>
        <h1 id="page-title">Asistente de orientación</h1>
        <p className="heroText">
          Consultá sobre modalidad, fechas, contenidos, admisión y preinscripción de la Diplomatura en Ingeniería de Soluciones basadas en Inteligencia Artificial.
        </p>
        <div className="infoGrid" aria-label="Datos principales de la diplomatura">
          <div>
            <strong>100 h</strong>
            <span>Duración</span>
          </div>
          <div>
            <strong>Virtual</strong>
            <span>Modalidad sincrónica</span>
          </div>
          <div>
            <strong>Jueves</strong>
            <span>18:00 a 20:30</span>
          </div>
        </div>
        <div className="admissionCard">
          <span>Preinscripción abierta</span>
          <p>Si necesitás hablar con una persona, dejá tu nombre, email y motivo de consulta.</p>
        </div>
      </section>

      <section className="chatPanel" aria-label="Chat con el asistente">
        <header className="chatHeader">
          <div>
            <p>Asistente LIDeSIA</p>
            <span>Orientación sobre la diplomatura</span>
          </div>
          <div className="chatActions">
            <button type="button" className="ghostButton" onClick={() => setShowSettings((value) => !value)} aria-expanded={showSettings}>
              <SettingsIcon /> Configurar
            </button>
            <button type="button" className="ghostButton" onClick={clearConversation}>Limpiar</button>
          </div>
        </header>

        {showSettings && (
          <form className="settingsBox" onSubmit={saveSettings}>
            <label htmlFor="webhook-url">Conexión del asistente</label>
            <input id="webhook-url" value={webhookUrl} onChange={(event) => setWebhookUrl(event.target.value)} placeholder={WEBHOOK_PATH} />
            <div className="settingsActions">
              <button type="button" onClick={useProductionWebhook}>Restaurar</button>
              <button type="button" onClick={useTestWebhook}>Prueba</button>
              <button type="submit" className="primarySmall">Guardar</button>
            </div>
            <p>Esta opción queda oculta para la demo final y sirve solo durante la configuración.</p>
          </form>
        )}

        <div className="messages" role="log" aria-live="polite" aria-label="Mensajes del chat">
          {messages.map((message, index) => <Message key={`${message.createdAt}-${index}`} message={message} />)}
          <div ref={bottomRef} />
        </div>

        {error && <p className="errorBox" role="alert">{error}</p>}

        <form className="composer" onSubmit={sendMessage}>
          <label className="srOnly" htmlFor="chat-input">Escribir consulta</label>
          <textarea
            id="chat-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) sendMessage(event);
            }}
            placeholder="Escribí una consulta sobre la diplomatura..."
            rows={2}
          />
          <button type="submit" className="sendButton" disabled={isSending || !input.trim()}>
            {isSending ? "Enviando" : "Enviar"} <SendIcon />
          </button>
        </form>
      </section>
    </main>
  );
}

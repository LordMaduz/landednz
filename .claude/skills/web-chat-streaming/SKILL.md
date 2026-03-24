# Skill: Web Chat Streaming
# Domain knowledge for consuming SSE streams, rendering tokens, and managing chat UI state.
# Preloaded by: senior-software-engineer agent
# Visual truth: mockup-screens/landednz-screen-chat-interface.jsx

---

## What this skill covers

SSE consumption via fetch + ReadableStream (not EventSource — we need auth headers),
token-by-token rendering without layout jitter, citation badge extraction from stream
markers, thinking state management, entry-point-aware opening messages, and the
**floating chat overlay** pattern (Intercom Fin style, NOT a slide-in side panel).

---

## Files in scope

```
apps/web/src/
├── components/chat/
│   ├── ChatPanel.tsx               ← FLOATING OVERLAY (420×600px, fixed bottom-right)
│   ├── ChatFAB.tsx                 ← Floating action button (56px circle) when panel closed
│   ├── ChatHeader.tsx              ← Logo avatar + "LandedNZ Advisor" + close button
│   ├── ChatMessage.tsx             ← AI/user message bubble with citations
│   ├── ChatInput.tsx               ← Multi-line input with send button
│   ├── ThinkingIndicator.tsx       ← Pulsing dots + contextual status text
│   ├── CitationBadge.tsx           ← Inline source pill (e.g., "ird.govt.nz")
│   ├── SourceFooter.tsx            ← "Sources: [pill] [pill]" at bottom of AI message
│   └── SuggestedQuestion.tsx       ← Tappable question chip below opening message
├── lib/hooks/useChat.ts            ← SSE consumption + state management
└── lib/stores/chatStore.ts         ← Zustand: messages, streaming state, entry point
```

---

## Chat panel — floating overlay (NOT slide-in panel)

**Critical design decision:** The chat panel is a floating overlay rendered via React
Portal, positioned fixed at bottom-right. It is NOT part of the layout grid, NOT a
sidebar panel, NOT a third column. It floats above the current content.

```tsx
// ChatPanel.tsx — rendered via Portal
function ChatPanel({ onClose }) {
  return createPortal(
    <div className="fixed bottom-6 right-6 w-[420px] h-[600px] max-h-[calc(100vh-48px)]
                    bg-bg-card rounded-2xl border border-border shadow-chat-panel
                    flex flex-col overflow-hidden z-50
                    animate-slide-up-panel">
      <ChatHeader onClose={onClose} />
      <ChatMessages />
      <ChatInput />
    </div>,
    document.body
  );
}

// ChatFAB.tsx — visible when panel is closed
function ChatFAB({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 rounded-full
                 bg-primary shadow-chat-panel z-50
                 flex items-center justify-center
                 hover:scale-105 transition-transform"
    >
      <MessageCircle className="w-6 h-6 text-text-inverse" />
    </button>
  );
}
```

Mobile (<768px): navigates to `/chat` full page instead of floating panel.

**Visual reference:** `mockup-screens/landednz-screen-chat-interface.jsx`

---

## SSE event format (from backend — do not change)

```
data: {"type":"chunk","text":"For your IRD "}
data: {"type":"chunk","text":"application, you'll "}
data: {"type":"chunk","text":"need these documents:"}
data: {"type":"done"}
```

Error case:
```
data: {"type":"error","message":"AI service unavailable"}
```

---

## SSE consumption pattern (fetch + ReadableStream)

Do NOT use `EventSource` — it does not support custom headers (Authorization).

```typescript
async function streamChat(
  sessionId: string,
  message: string,
  token: string,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (message: string) => void,
) {
  const res = await fetch(`${API_BASE}/chat/sessions/${sessionId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content: message }),
  });

  if (!res.ok || !res.body) {
    onError('Failed to connect to chat service');
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      try {
        const event = JSON.parse(line.slice(6));
        if (event.type === 'chunk') onChunk(event.text);
        else if (event.type === 'done') { onDone(); return; }
        else if (event.type === 'error') { onError(event.message); return; }
      } catch { /* skip malformed */ }
    }
  }
}
```

---

## useChat hook pattern

```typescript
export function useChat() {
  const { messages, isStreaming, currentStreamText, addMessage,
    startStream, appendChunk, endStream, setError } = useChatStore();

  async function sendMessage(content: string) {
    addMessage({ role: 'user', content });
    startStream();

    await streamChat(
      sessionId, content, token,
      (text) => appendChunk(text),
      () => endStream(),
      (errorMsg) => setError(errorMsg),
    );
  }

  return { messages, isStreaming, currentStreamText, sendMessage };
}
```

---

## Token rendering without layout jitter

Critical: the chat panel has FIXED dimensions (420×600px). Messages scroll within.
The panel itself never resizes.

1. Message container: `flex-1 overflow-y-auto` inside the fixed-size panel
2. Auto-scroll: `scrollToBottom()` after each chunk
3. Streaming message starts empty, tokens fill it in-place
4. Container auto-scrolls to keep streaming bubble visible

---

## Thinking indicator

Shows while waiting for the first token. Contextual status text that evolves:

```tsx
function ThinkingIndicator() {
  const [statusText, setStatusText] = useState('Checking NZ settlement guidance...');

  useEffect(() => {
    const timer = setTimeout(() => {
      setStatusText('Looking up information for your situation...');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-start gap-2.5 px-1">
      <ChatAvatar />
      <div>
        <div className="flex gap-1.5 mb-2 mt-1.5">
          {[0, 1, 2].map(i => (
            <span key={i}
              className="w-[7px] h-[7px] rounded-full bg-primary"
              style={{ animation: `typing 1s ease-in-out ${i * 0.15}s infinite` }}
            />
          ))}
        </div>
        <p className="text-caption text-text-tertiary">{statusText}</p>
      </div>
    </div>
  );
}
```

Reduced motion: dots static at 0.7 opacity, status text still shows.

---

## Citation badges (inline source pills)

From mockup: small rounded pills within AI response text showing source name.

```tsx
function CitationBadge({ source }: { source: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-badge
                     bg-bg text-caption font-medium text-primary
                     border border-border cursor-pointer
                     hover:bg-primary-light hover:border-primary transition-colors">
      <ExternalLink className="w-[9px] h-[9px]" />
      {source}
    </span>
  );
}
```

---

## Source footer

Every AI message ends with a sources section:

```tsx
function SourceFooter({ sources }: { sources: string[] }) {
  return (
    <div className="mt-3 pt-2.5 border-t border-border flex items-center gap-1.5 flex-wrap">
      <span className="text-caption text-text-tertiary font-medium">Sources:</span>
      {sources.map((s, i) => <CitationBadge key={i} source={s} />)}
    </div>
  );
}
```

---

## Entry-point-aware opening messages

| Entry point | Opening message |
|-------------|----------------|
| TASK_CARD | "You're looking at the [task name] task. What would you like to know?" |
| ROADMAP | "Hi [name] — you've completed [X] tasks so far. What's your next question?" |
| NAVIGATION | "Hi [name] — ask me anything about settling in New Zealand." |

**Never show generic "Hi! How can I help?"** — explicit anti-pattern from research.

---

## AI message structure (from mockup)

```tsx
function AIMessage({ content, sources, timestamp }) {
  return (
    <div className="flex gap-2.5 mb-4 px-1">
      <ChatAvatar />
      <div className="flex-1 min-w-0 max-w-[88%]">
        <div className="bg-bg-card border border-border rounded-[4px_12px_12px_12px] p-3.5">
          {/* "Based on official NZ sources" header */}
          <p className="text-caption text-text-tertiary font-medium mb-2">
            Based on official NZ sources
          </p>
          {content}
          {sources && <SourceFooter sources={sources} />}
        </div>
        <p className="text-caption text-text-tertiary mt-1.5">
          LandedNZ · AI Advisor · {timestamp}
        </p>
      </div>
    </div>
  );
}
```

---

## Chat input

```tsx
function ChatInput({ onSend, isStreaming, placeholder }) {
  const [value, setValue] = useState('');

  const handleSend = () => {
    if (!value.trim() || isStreaming) return;
    onSend(value.trim());
    setValue('');
  };

  return (
    <div className="border-t border-border p-3 flex-shrink-0">
      <div className="flex items-end gap-2 bg-bg rounded-xl p-2.5 border border-border
                      focus-within:border-primary transition-colors">
        <textarea
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder={placeholder || "Ask about your settlement..."}
          rows={1}
          className="flex-1 resize-none bg-transparent border-none outline-none
                     text-body text-text-primary placeholder:text-text-tertiary
                     max-h-[72px] overflow-y-auto"
        />
        <button
          onClick={handleSend}
          disabled={!value.trim() || isStreaming}
          className="w-[34px] h-[34px] rounded-full bg-primary flex items-center
                     justify-center flex-shrink-0 disabled:opacity-40
                     hover:bg-primary-hover transition-colors"
        >
          <Send className="w-4 h-4 text-text-inverse" />
        </button>
      </div>
      <p className="text-caption text-text-tertiary text-center mt-2">
        Responses are AI-generated. Always verify with official sources.
      </p>
    </div>
  );
}
```

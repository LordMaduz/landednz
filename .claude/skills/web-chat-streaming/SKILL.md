# Skill: Web Chat Streaming
# Domain knowledge for consuming SSE streams, rendering tokens, and managing chat UI state.
# Preloaded by: senior-software-engineer agent

---

## What this skill covers

SSE consumption via fetch + ReadableStream (not EventSource — we need auth headers),
token-by-token rendering without layout jitter, citation badge extraction from stream
markers, thinking state management, entry-point-aware opening messages, and chat panel
layout patterns. Reference documents: 14-ui-ux-design.md (Chat Interface section),
phase4-ai-chat-basic/REQUEST.md (SSE event format).

---

## Files in scope

```
apps/web/src/
├── components/chat/
│   ├── ChatPanel.tsx               ← Slide-in or full-page chat container
│   ├── ChatMessage.tsx             ← AI/user message bubble with citations
│   ├── ChatInput.tsx               ← Multi-line input with send button
│   ├── ThinkingIndicator.tsx       ← Pulsing dots + status text
│   ├── CitationBadge.tsx           ← Inline source pill (e.g., "ird.govt.nz +2")
│   └── SourceFooter.tsx            ← "Source: [Agency] — [URL]" at end of message
├── lib/hooks/useChat.ts            ← SSE consumption + state management
└── lib/stores/chatStore.ts         ← Zustand: messages, streaming state, entry point
```

---

## SSE event format (from backend — do not change)

The Fastify API sends these SSE events:

```
data: {"type":"chunk","text":"For your IRD "}
data: {"type":"chunk","text":"application, you'll "}
data: {"type":"chunk","text":"need these documents:"}
data: {"type":"done"}
```

Error case (after headers sent):
```
data: {"type":"error","message":"AI service unavailable"}
```

---

## SSE consumption pattern (fetch + ReadableStream)

Do NOT use `EventSource` — it does not support custom headers (Authorization).
Use `fetch` with `ReadableStream`:

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
    buffer = lines.pop() || '';  // Keep incomplete line in buffer

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const json = line.slice(6);  // Remove "data: " prefix
      
      try {
        const event = JSON.parse(json);
        
        if (event.type === 'chunk') {
          onChunk(event.text);
        } else if (event.type === 'done') {
          onDone();
          return;
        } else if (event.type === 'error') {
          onError(event.message);
          return;
        }
      } catch {
        // Malformed JSON — skip this line
      }
    }
  }
}
```

---

## useChat hook pattern

```typescript
// lib/hooks/useChat.ts
import { useChatStore } from '../stores/chatStore';

export function useChat() {
  const { messages, isStreaming, currentStreamText, addMessage,
    startStream, appendChunk, endStream, setError } = useChatStore();

  async function sendMessage(content: string) {
    // 1. Add user message to state
    addMessage({ role: 'user', content });
    
    // 2. Start streaming state (shows ThinkingIndicator)
    startStream();
    
    // 3. Stream response
    await streamChat(
      sessionId,
      content,
      token,
      (text) => appendChunk(text),     // Each chunk appends to currentStreamText
      () => {
        // 4. On done: convert accumulated text to a complete AI message
        endStream();
      },
      (errorMsg) => {
        // 5. On error: show as system message in thread
        setError(errorMsg);
      },
    );
  }

  return { messages, isStreaming, currentStreamText, sendMessage };
}
```

---

## Token rendering without layout jitter

The critical UX requirement: as tokens arrive, the chat message container must NOT
resize or jump. The user should see text appearing smoothly.

**Key implementation rules:**

1. The chat message container has a FIXED height (e.g., `calc(100vh - headerHeight - inputHeight)`)
2. Messages scroll within this fixed container — the container itself never resizes
3. Auto-scroll: `scrollToBottom()` called after each chunk append
4. The streaming message starts as an empty bubble at the bottom, tokens fill it
5. Container auto-scrolls to keep the streaming bubble visible

```tsx
function ChatMessageList({ messages, isStreaming, currentStreamText }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll on new content
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, currentStreamText]);
  
  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      {messages.map((msg, i) => (
        <ChatMessage key={i} message={msg} />
      ))}
      
      {isStreaming && (
        <>
          {currentStreamText ? (
            <ChatMessage message={{ role: 'assistant', content: currentStreamText }} isStreaming />
          ) : (
            <ThinkingIndicator />
          )}
        </>
      )}
    </div>
  );
}
```

---

## Thinking indicator

Shows while waiting for the first token from the stream:

```tsx
function ThinkingIndicator() {
  const [statusText, setStatusText] = useState('Checking NZ settlement guidance...');
  
  // After 2s, update to more specific text
  useEffect(() => {
    const timer = setTimeout(() => {
      setStatusText('Looking up information for your situation...');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="flex items-start gap-3 max-w-[85%]">
      <div className="bg-bg-card border border-border rounded-card p-4">
        <div className="flex gap-1.5 mb-2">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150" />
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse delay-300" />
        </div>
        <p className="text-secondary text-text-tertiary">{statusText}</p>
      </div>
    </div>
  );
}
```

When `prefers-reduced-motion: reduce`: dots are static (no pulse), status text still shows.

---

## Citation badge extraction

The AI response may contain citation markers in the text. The exact format depends on
the AI system prompt output, but the pattern for web rendering is:

```tsx
function CitationBadge({ source, count }: { source: string; count?: number }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-badge',
      'bg-bg-sidebar text-caption text-text-secondary',
      'cursor-pointer hover:bg-primary-subtle transition-colors'
    )}>
      {source}
      {count && count > 0 && <span className="ml-1 text-text-tertiary">+{count}</span>}
    </span>
  );
}
```

Citation badges appear inline within the AI response text. They are clickable —
clicking expands to show the full source URL.

---

## Source footer

Every AI response ends with a structured source section:

```tsx
function SourceFooter({ sourceName, sourceUrl }: { sourceName: string; sourceUrl: string }) {
  return (
    <div className="mt-3 pt-3 border-t border-border">
      <p className="text-caption text-text-tertiary">
        Source: {sourceName} —{' '}
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {sourceUrl}
        </a>
      </p>
    </div>
  );
}
```

---

## Entry-point-aware opening messages

When a chat session is created, the API returns an `openingMessage` based on entry point.
The web app displays this as the first AI message in the thread.

| Entry point | Opening message pattern |
|-------------|------------------------|
| TASK_CARD | "You're looking at the [task name] task. What would you like to know?" |
| ROADMAP | "Hi [name] — you've completed [X] tasks so far. What's your next question?" |
| NAVIGATION | "Hi [name] — ask me anything about settling in New Zealand." |
| EMAIL_DEEPLINK | Same as TASK_CARD (links to specific task context) |

The opening message is NOT an AI call — it's static text from `buildChatOpeningMessage()`
on the backend. The web app just renders it as the first message in the thread.

**Never show a generic "Hi! How can I help?"** — this is an explicit anti-pattern
from 13-ui-ux-research.md.

---

## Chat input

```tsx
function ChatInput({ onSend, isStreaming, placeholder }: ChatInputProps) {
  const [value, setValue] = useState('');
  
  const handleSend = () => {
    if (!value.trim() || isStreaming) return;
    onSend(value.trim());
    setValue('');
  };
  
  return (
    <div className="border-t border-border p-4 bg-bg-card">
      <div className="flex items-end gap-2">
        <textarea
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder={placeholder}
          rows={1}
          className={cn(
            'flex-1 resize-none bg-bg-card border border-border rounded-input',
            'px-4 py-3 text-body text-text-primary placeholder:text-text-tertiary',
            'focus:outline-none focus:ring-2 focus:ring-border-focus',
            'max-h-[120px] overflow-y-auto'
          )}
        />
        <button
          onClick={handleSend}
          disabled={!value.trim() || isStreaming}
          className={cn(
            'w-10 h-10 rounded-full bg-primary text-text-inverse',
            'flex items-center justify-center',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'hover:bg-primary-hover transition-colors'
          )}
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      </div>
      <p className="text-caption text-text-tertiary mt-2">
        Responses are AI-generated. Always verify with official sources.
      </p>
    </div>
  );
}
```

Enter sends message. Shift+Enter adds newline. Textarea auto-expands to 3 lines max.
Send button disabled while streaming or input is empty.
import { useState, useEffect, useRef } from "react";

// LandedNZ Chat Interface — Screen 5
// Pattern: Intercom Fin floating overlay panel
// Entry-point-aware, structured responses, inline citations, thinking state
// Overlays current content — does not change the layout

const COLORS = {
  primary: "#1B6B6D",
  primaryHover: "#15585A",
  primaryLight: "#E8F4F4",
  primarySubtle: "#F0F8F8",
  secondary: "#D4A843",
  secondaryLight: "#FDF6E7",
  secondaryHover: "#C09338",
  bg: "#F8F6F3",
  bgCard: "#FFFFFF",
  bgSidebar: "#F2F0ED",
  textPrimary: "#1A1A2E",
  textSecondary: "#5A5A6E",
  textTertiary: "#8E8E9A",
  textInverse: "#FFFFFF",
  success: "#2D8A5E",
  successLight: "#E8F5EE",
  warning: "#D4A843",
  warningLight: "#FDF6E7",
  error: "#C75B4A",
  border: "#E5E3E0",
  borderHover: "#D0CEC8",
};

const styleSheet = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Serif+Display&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }
  body, html {
    font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    -webkit-font-smoothing: antialiased;
    background: ${COLORS.bg};
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slideUpPanel {
    from { opacity: 0; transform: translateY(20px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes pulseGlow {
    0%, 100% { opacity: 0.35; }
    50% { opacity: 1; }
  }
  @keyframes typing {
    0%, 100% { opacity: 0.3; transform: translateY(0); }
    50% { opacity: 1; transform: translateY(-3px); }
  }

  .chat-panel {
    animation: slideUpPanel 0.3s ease-out;
  }

  .msg-ai {
    animation: fadeInUp 0.25s ease-out;
  }

  .msg-user {
    animation: fadeIn 0.1s ease-out;
  }

  .chat-input-area textarea {
    border: none;
    outline: none;
    resize: none;
    font-family: inherit;
    font-size: 0.9375rem;
    line-height: 1.5;
    color: ${COLORS.textPrimary};
    background: transparent;
    width: 100%;
  }

  .chat-input-area textarea::placeholder {
    color: ${COLORS.textTertiary};
  }

  .send-btn {
    transition: all 0.15s ease;
    cursor: pointer;
    border: none;
  }
  .send-btn:hover {
    background: ${COLORS.primaryHover} !important;
    transform: scale(1.05);
  }
  .send-btn:disabled {
    opacity: 0.4;
    cursor: default;
    transform: none !important;
  }
  .send-btn:disabled:hover {
    background: ${COLORS.primary} !important;
  }

  .source-pill {
    transition: all 0.12s ease;
    cursor: pointer;
  }
  .source-pill:hover {
    background: ${COLORS.primaryLight} !important;
    border-color: ${COLORS.primary} !important;
  }

  .chat-fab {
    transition: all 0.2s ease;
    cursor: pointer;
    border: none;
  }
  .chat-fab:hover {
    transform: scale(1.06);
    box-shadow: 0 8px 28px rgba(27, 107, 109, 0.35) !important;
  }

  .sidebar-item {
    transition: all 0.12s ease;
    cursor: pointer;
    border: none;
    outline: none;
    background: transparent;
    width: 100%;
    text-align: left;
  }
  .sidebar-item:hover {
    background: rgba(27, 107, 109, 0.06) !important;
  }

  .task-row-bg {
    transition: all 0.12s ease;
  }
  .task-row-bg:hover {
    background: ${COLORS.primarySubtle};
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 2px; }
`;

// ─── Thinking Indicator ───
function ThinkingIndicator({ status }) {
  return (
    <div className="msg-ai" style={{ display: "flex", gap: 10, marginBottom: 16, padding: "0 4px" }}>
      <div
        style={{
          width: 28, height: 28, borderRadius: "50%", background: COLORS.primaryLight,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke={COLORS.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div>
        <div style={{ display: "flex", gap: 5, marginBottom: 8, marginTop: 6 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 7, height: 7, borderRadius: "50%", background: COLORS.primary,
                animation: `typing 1s ease-in-out ${i * 0.15}s infinite`,
              }}
            />
          ))}
        </div>
        {status && (
          <p style={{ fontSize: "0.75rem", color: COLORS.textTertiary, animation: "fadeIn 0.3s ease-out" }}>
            {status}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Source Pill ───
function SourcePill({ name }) {
  return (
    <span
      className="source-pill"
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        fontSize: "0.6875rem", fontWeight: 500,
        background: COLORS.bg, border: `1px solid ${COLORS.border}`,
        padding: "2px 8px", borderRadius: 100,
        color: COLORS.primary, verticalAlign: "middle",
      }}
    >
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {name}
    </span>
  );
}

// ─── AI Message ───
function AIMessage({ content, sources, timestamp }) {
  return (
    <div className="msg-ai" style={{ display: "flex", gap: 10, marginBottom: 16, padding: "0 4px" }}>
      {/* Avatar */}
      <div
        style={{
          width: 28, height: 28, borderRadius: "50%", background: COLORS.primaryLight,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke={COLORS.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div style={{ flex: 1, minWidth: 0, maxWidth: "88%" }}>
        {/* Message bubble */}
        <div
          style={{
            background: COLORS.bgCard,
            border: `1px solid ${COLORS.border}`,
            borderRadius: "4px 12px 12px 12px",
            padding: "14px 16px",
          }}
        >
          {content}

          {/* Source footer */}
          {sources && (
            <div
              style={{
                borderTop: `1px solid ${COLORS.border}`,
                marginTop: 12,
                paddingTop: 10,
                display: "flex",
                alignItems: "center",
                gap: 6,
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: "0.6875rem", color: COLORS.textTertiary, fontWeight: 500 }}>
                Sources:
              </span>
              {sources.map((s, i) => (
                <SourcePill key={i} name={s} />
              ))}
            </div>
          )}
        </div>

        {/* Attribution */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
          <span style={{ fontSize: "0.6875rem", color: COLORS.textTertiary }}>
            LandedNZ · AI Advisor · {timestamp || "Just now"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── User Message ───
function UserMessage({ text }) {
  return (
    <div className="msg-user" style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16, padding: "0 4px" }}>
      <div
        style={{
          background: COLORS.primaryLight,
          border: `1px solid rgba(27, 107, 109, 0.15)`,
          borderRadius: "12px 4px 12px 12px",
          padding: "10px 14px",
          maxWidth: "80%",
          fontSize: "0.9375rem",
          lineHeight: 1.5,
          color: COLORS.textPrimary,
        }}
      >
        {text}
      </div>
    </div>
  );
}

// ─── Chat Panel ───
function ChatPanel({ onClose, entryContext }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStatus, setThinkingStatus] = useState("");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const [step, setStep] = useState(0);

  // Simulate conversation flow
  useEffect(() => {
    // Opening message — entry-point-aware
    const timer = setTimeout(() => {
      setMessages([
        {
          type: "ai",
          content: (
            <div>
              <p style={{ fontSize: "0.8125rem", color: COLORS.textTertiary, marginBottom: 8, fontWeight: 500 }}>
                Based on official NZ sources
              </p>
              <p style={{ fontSize: "0.9375rem", lineHeight: 1.6, color: COLORS.textPrimary }}>
                You're looking at the IRD number application. What would you like to know about this?
              </p>
              <p style={{ fontSize: "0.875rem", lineHeight: 1.55, color: COLORS.textSecondary, marginTop: 8 }}>
                I can help with eligibility, required documents, processing times, or what happens if you've already started work without one.
              </p>
            </div>
          ),
          timestamp: "Just now",
        },
      ]);
      setStep(1);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Auto-play demo conversation
  useEffect(() => {
    if (step === 2) {
      // User sent "What happens if my employer already deducted emergency tax?"
      setIsThinking(true);
      setThinkingStatus("Checking IRD emergency tax rules...");

      const t1 = setTimeout(() => {
        setThinkingStatus("Looking up refund process for overpaid PAYE...");
      }, 1200);

      const t2 = setTimeout(() => {
        setIsThinking(false);
        setThinkingStatus("");
        setMessages((prev) => [
          ...prev,
          {
            type: "ai",
            content: (
              <div>
                <p style={{ fontSize: "0.8125rem", color: COLORS.textTertiary, marginBottom: 8, fontWeight: 500 }}>
                  Based on official NZ sources
                </p>
                <p style={{ fontSize: "0.9375rem", lineHeight: 1.65, color: COLORS.textPrimary, marginBottom: 12 }}>
                  If your employer has already deducted tax at the emergency rate (45%), you can get the
                  difference refunded. Here's how:
                </p>

                {/* Numbered steps */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                  {[
                    <>Get your IRD number (you're already working on this) <SourcePill name="ird.govt.nz" /></>,
                    "Give your IRD number to your employer as soon as it arrives",
                    <>Submit a Tax code declaration form (IR330) — this sets your correct rate <SourcePill name="ird.govt.nz" /></>,
                    "Your employer adjusts future deductions immediately",
                    <>The overpaid tax is refunded in your end-of-year tax assessment, or you can request an early refund through myIR <SourcePill name="ird.govt.nz" /></>,
                  ].map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <div
                        style={{
                          width: 22, height: 22, borderRadius: "50%", background: COLORS.primarySubtle,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "0.6875rem", fontWeight: 600, color: COLORS.primary, flexShrink: 0, marginTop: 1,
                        }}
                      >
                        {i + 1}
                      </div>
                      <p style={{ fontSize: "0.875rem", lineHeight: 1.55, color: COLORS.textPrimary }}>
                        {s}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Key callout */}
                <div
                  style={{
                    background: COLORS.warningLight,
                    borderLeft: `3px solid ${COLORS.warning}`,
                    borderRadius: "0 8px 8px 0",
                    padding: "10px 14px",
                    marginBottom: 4,
                  }}
                >
                  <p style={{ fontSize: "0.8125rem", lineHeight: 1.55, color: COLORS.textPrimary }}>
                    <strong style={{ fontWeight: 600 }}>Typical refund:</strong> If you earned $1,200/week for 2 weeks at 45% vs your actual rate of 17.5%, that's roughly $660 overpaid — you'll get that back.
                  </p>
                </div>
              </div>
            ),
            sources: ["ird.govt.nz — Emergency tax", "ird.govt.nz — Tax code declaration IR330", "ird.govt.nz — Request early refund"],
            timestamp: "Just now",
          },
        ]);
        setStep(3);
      }, 2500);

      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [step]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const handleSend = () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { type: "user", text }]);

    if (step === 1) {
      setStep(2);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Suggested question
  const suggestedQ = "What happens if my employer already deducted emergency tax?";

  return (
    <div
      className="chat-panel"
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        width: 420,
        height: 600,
        maxHeight: "calc(100vh - 48px)",
        background: COLORS.bgCard,
        borderRadius: 16,
        border: `1px solid ${COLORS.border}`,
        boxShadow: "0 12px 48px rgba(26, 26, 46, 0.15), 0 4px 16px rgba(26, 26, 46, 0.08)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 1000,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 18px",
          borderBottom: `1px solid ${COLORS.border}`,
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 34, height: 34, borderRadius: "50%", background: COLORS.primaryLight,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke={COLORS.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "0.9375rem", fontWeight: 600, color: COLORS.textPrimary }}>
            LandedNZ Advisor
          </div>
          <div style={{ fontSize: "0.75rem", color: COLORS.textTertiary }}>
            AI-powered · Based on official NZ sources
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            width: 30, height: 30, borderRadius: 8, border: `1px solid ${COLORS.border}`,
            background: "transparent", display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "all 0.12s ease", flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.bg; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke={COLORS.textTertiary} strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 12px",
        }}
      >
        {messages.map((msg, i) =>
          msg.type === "ai" ? (
            <AIMessage key={i} content={msg.content} sources={msg.sources} timestamp={msg.timestamp} />
          ) : (
            <UserMessage key={i} text={msg.text} />
          )
        )}

        {isThinking && <ThinkingIndicator status={thinkingStatus} />}

        {/* Suggested question chip */}
        {step === 1 && !isThinking && (
          <div style={{ padding: "4px 4px 8px", animation: "fadeInUp 0.3s ease-out 0.3s both" }}>
            <p style={{ fontSize: "0.6875rem", color: COLORS.textTertiary, fontWeight: 500, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Try asking
            </p>
            <button
              onClick={() => {
                setInput("");
                setMessages((prev) => [...prev, { type: "user", text: suggestedQ }]);
                setStep(2);
              }}
              style={{
                display: "inline-block",
                padding: "8px 14px",
                borderRadius: 10,
                border: `1px solid ${COLORS.border}`,
                background: COLORS.bgCard,
                fontSize: "0.8125rem",
                color: COLORS.textSecondary,
                cursor: "pointer",
                textAlign: "left",
                lineHeight: 1.45,
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.primary; e.currentTarget.style.color = COLORS.primary; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = COLORS.textSecondary; }}
            >
              {suggestedQ}
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div
        style={{
          borderTop: `1px solid ${COLORS.border}`,
          padding: "12px 14px",
          flexShrink: 0,
        }}
      >
        <div
          className="chat-input-area"
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 8,
            background: COLORS.bg,
            borderRadius: 12,
            padding: "10px 14px",
            border: `1px solid ${COLORS.border}`,
            transition: "border-color 0.15s ease",
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this task..."
            rows={1}
            style={{
              flex: 1,
              maxHeight: 72,
              minHeight: 24,
            }}
            onFocus={(e) => { e.target.closest('.chat-input-area').style.borderColor = COLORS.primary; }}
            onBlur={(e) => { e.target.closest('.chat-input-area').style.borderColor = COLORS.border; }}
          />
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={!input.trim()}
            style={{
              width: 34, height: 34, borderRadius: "50%",
              background: COLORS.primary,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <p style={{ fontSize: "0.6875rem", color: COLORS.textTertiary, textAlign: "center", marginTop: 8 }}>
          Responses are AI-generated. Always verify with official sources.
        </p>
      </div>
    </div>
  );
}

// ─── Simplified Background (Roadmap context) ───
function BackgroundContent() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div style={{ width: 256, background: COLORS.bgSidebar, borderRight: `1px solid ${COLORS.border}`, flexShrink: 0, padding: "20px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px 20px" }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: COLORS.secondary, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke={COLORS.textPrimary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.125rem", color: COLORS.textPrimary }}>LandedNZ</span>
        </div>

        {[
          { label: "Roadmap", active: true, icon: "◉" },
          { label: "Chat", active: false, icon: "💬" },
          { label: "Settings", active: false, icon: "⚙" },
        ].map((item) => (
          <button
            key={item.label}
            className="sidebar-item"
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 12px", borderRadius: 8, fontSize: "0.875rem",
              fontWeight: item.active ? 600 : 400,
              color: item.active ? COLORS.primary : COLORS.textSecondary,
              background: item.active ? COLORS.primaryLight : "transparent",
              borderLeft: item.active ? `3px solid ${COLORS.primary}` : "3px solid transparent",
            }}
          >
            <span style={{ fontSize: "0.9rem", width: 20, textAlign: "center" }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      {/* Content (blurred/dimmed when chat is open) */}
      <div style={{ flex: 1, padding: "28px 40px", maxWidth: 960, opacity: 0.5, filter: "blur(1px)", pointerEvents: "none" }}>
        {/* Hero card */}
        <div
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary} 0%, #145254 100%)`,
            borderRadius: 12, padding: "22px 24px",
            display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24,
          }}
        >
          <div>
            <p style={{ fontSize: "1.25rem", fontWeight: 500, color: COLORS.textInverse, marginBottom: 4, fontFamily: "'DM Serif Display', serif" }}>Hi Priya</p>
            <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.75)", marginBottom: 10 }}>Your First 90 Days in New Zealand</p>
            <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.5)" }}>2 completed · 1 in progress · 8 remaining</p>
          </div>
          <div style={{ width: 72, height: 72, borderRadius: "50%", border: "5px solid rgba(255,255,255,0.12)" }} />
        </div>

        {/* Task rows */}
        <h2 style={{ fontSize: "1rem", fontWeight: 600, color: COLORS.textPrimary, marginBottom: 10 }}>Do these first</h2>
        {[
          { name: "Apply for your IRD number", sub: "Without this, your first paycheck is taxed at 45%", status: "in_progress" },
          { name: "Submit your tax code declaration", sub: "Your employer can't calculate your correct tax rate", status: "not_started" },
          { name: "Register with a GP", sub: "Walk-in visits cost $50–80", status: "not_started" },
        ].map((t, i) => (
          <div
            key={i}
            className="task-row-bg"
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 16px", borderRadius: 10,
              border: `1px solid ${COLORS.border}`, background: COLORS.bgCard,
              marginBottom: 6,
              borderLeft: t.status === "in_progress" ? `3px solid ${COLORS.primary}` : `1px solid ${COLORS.border}`,
            }}
          >
            <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${t.status === "in_progress" ? COLORS.primary : COLORS.border}` }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.9375rem", fontWeight: 500, color: COLORS.textPrimary }}>{t.name}</div>
              <div style={{ fontSize: "0.8125rem", color: COLORS.textTertiary }}>{t.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main App ───
export default function ChatInterface() {
  const [chatOpen, setChatOpen] = useState(true);

  return (
    <div style={{ position: "relative", minHeight: "100vh", background: COLORS.bg, overflow: "hidden" }}>
      <style>{styleSheet}</style>

      <BackgroundContent />

      {/* Chat FAB (when closed) */}
      {!chatOpen && (
        <button
          className="chat-fab"
          onClick={() => setChatOpen(true)}
          style={{
            position: "fixed", bottom: 24, right: 24,
            width: 56, height: 56, borderRadius: "50%",
            background: COLORS.primary,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 16px rgba(27, 107, 109, 0.3)",
            zIndex: 1000,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {/* Chat Panel */}
      {chatOpen && (
        <ChatPanel
          onClose={() => setChatOpen(false)}
          entryContext="task:ird_number"
        />
      )}
    </div>
  );
}

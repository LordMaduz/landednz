import { useState } from "react";

// LandedNZ Premium Gate — Screen 6
// NOT a separate page. Inline card within roadmap between free and premium tasks.
// Three paths: upgrade, defer, decline. Aspirational copy, never punitive.

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
  blocked: "#8E8E9A",
  blockedLight: "#F2F2F4",
  premiumGold: "#D4A843",
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

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .upgrade-btn {
    transition: all 0.2s ease;
    cursor: pointer;
    border: none;
  }
  .upgrade-btn:hover {
    background: ${COLORS.primaryHover} !important;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(27, 107, 109, 0.3);
  }

  .defer-btn {
    transition: all 0.15s ease;
    cursor: pointer;
  }
  .defer-btn:hover {
    background: ${COLORS.primarySubtle} !important;
    border-color: ${COLORS.primary} !important;
  }

  .decline-link {
    transition: all 0.12s ease;
    cursor: pointer;
    border: none;
    background: transparent;
  }
  .decline-link:hover {
    color: ${COLORS.textPrimary} !important;
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

  .task-row {
    transition: all 0.15s ease;
    cursor: pointer;
  }
  .task-row:hover {
    border-color: ${COLORS.borderHover} !important;
    background: ${COLORS.primarySubtle} !important;
  }

  .banner-close {
    transition: all 0.12s ease;
    cursor: pointer;
    border: none;
    background: transparent;
  }
  .banner-close:hover {
    color: ${COLORS.textPrimary} !important;
  }

  .banner-upgrade {
    transition: all 0.12s ease;
    cursor: pointer;
    border: none;
    background: transparent;
  }
  .banner-upgrade:hover {
    color: ${COLORS.primaryHover} !important;
    text-decoration: underline;
  }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 3px; }
`;

function StatusIcon({ status, size = 18 }) {
  const s = size;
  if (status === "complete")
    return (
      <div style={{ width: s, height: s, borderRadius: "50%", background: COLORS.success, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width={s * 0.6} height={s * 0.6} viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
    );
  if (status === "in_progress")
    return <div style={{ width: s, height: s, borderRadius: "50%", border: `2px solid ${COLORS.primary}`, background: `conic-gradient(${COLORS.primary} 0deg 180deg, transparent 180deg 360deg)`, flexShrink: 0 }} />;
  if (status === "premium_locked")
    return (
      <div style={{ width: s, height: s, borderRadius: "50%", background: COLORS.secondaryLight, border: `1.5px solid ${COLORS.premiumGold}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width={s * 0.55} height={s * 0.55} viewBox="0 0 24 24" fill="none">
          <rect x="3" y="11" width="18" height="11" rx="2" stroke={COLORS.premiumGold} strokeWidth="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" stroke={COLORS.premiumGold} strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    );
  return <div style={{ width: s, height: s, borderRadius: "50%", border: `2px solid ${COLORS.border}`, flexShrink: 0 }} />;
}

// ─── Task Row ───
function TaskRow({ task }) {
  const isComplete = task.status === "complete";
  const isPremium = task.status === "premium_locked";
  const isMuted = isComplete;

  return (
    <div
      className="task-row"
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "11px 16px", borderRadius: 10,
        border: `1px solid ${COLORS.border}`,
        background: COLORS.bgCard,
        marginBottom: 6,
        opacity: isComplete ? 0.7 : 1,
        borderLeft: task.status === "in_progress" ? `3px solid ${COLORS.primary}` : isPremium ? `3px solid ${COLORS.premiumGold}` : `1px solid ${COLORS.border}`,
      }}
    >
      <StatusIcon status={task.status} size={18} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "0.9375rem", fontWeight: isMuted ? 400 : 500, color: isMuted ? COLORS.textSecondary : COLORS.textPrimary, lineHeight: 1.4, marginBottom: 2 }}>
          {task.name}
        </div>
        <div style={{ fontSize: "0.8125rem", color: COLORS.textTertiary, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {isComplete ? `Completed ${task.completedDate}` : isPremium ? task.consequence.slice(0, 60) + "..." : task.consequence}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {isPremium && (
          <span style={{ fontSize: "0.6875rem", fontWeight: 500, background: COLORS.secondaryLight, color: COLORS.secondaryHover, padding: "3px 10px", borderRadius: 100, display: "flex", alignItems: "center", gap: 4 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke={COLORS.premiumGold} strokeWidth="2" /><path d="M7 11V7a5 5 0 0110 0v4" stroke={COLORS.premiumGold} strokeWidth="2" strokeLinecap="round" /></svg>
            Premium
          </span>
        )}
        {!isComplete && !isPremium && task.time && (
          <span style={{ fontSize: "0.75rem", color: COLORS.textTertiary, display: "flex", alignItems: "center", gap: 4 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={COLORS.textTertiary} strokeWidth="1.5" /><path d="M12 6v6l4 2" stroke={COLORS.textTertiary} strokeWidth="1.5" strokeLinecap="round" /></svg>
            {task.time}
          </span>
        )}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.3 }}><path d="M9 18l6-6-6-6" stroke={COLORS.textTertiary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
    </div>
  );
}

// ─── Premium Gate Card ───
function PremiumGateCard({ onUpgrade, onDefer, onDecline }) {
  return (
    <div style={{ animation: "fadeInUp 0.4s ease-out", marginBottom: 6 }}>
      <div
        style={{
          background: COLORS.bgCard,
          borderRadius: 14,
          border: `1px solid ${COLORS.border}`,
          borderTop: `3px solid ${COLORS.premiumGold}`,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Subtle gold gradient at top */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 80, background: `linear-gradient(180deg, rgba(212, 168, 67, 0.06) 0%, transparent 100%)`, pointerEvents: "none" }} />

        <div style={{ padding: "32px 28px", position: "relative" }}>
          {/* Badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: COLORS.secondaryLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" stroke={COLORS.premiumGold} strokeWidth="1.5" fill="rgba(212, 168, 67, 0.15)" strokeLinejoin="round" />
              </svg>
            </div>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: COLORS.premiumGold, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Premium
            </span>
          </div>

          {/* Heading */}
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.375rem", fontWeight: 400, color: COLORS.textPrimary, marginBottom: 8, lineHeight: 1.35 }}>
            Your first two weeks are covered.
            <br />
            Ready to keep going?
          </h2>
          <p style={{ fontSize: "0.9375rem", color: COLORS.textSecondary, marginBottom: 24, lineHeight: 1.5 }}>
            Your full 8-week settlement plan includes:
          </p>

          {/* Benefits */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
            {[
              { text: "Complete Phase 3 roadmap — weeks 3 through 8", icon: "📋" },
              { text: "AI settlement advisor — ask any NZ question, get sourced answers", icon: "💬" },
              { text: "Smart reminders — we'll alert you before deadlines pass", icon: "⏰" },
            ].map((b, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: COLORS.successLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke={COLORS.success} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <p style={{ fontSize: "0.9375rem", lineHeight: 1.5, color: COLORS.textPrimary }}>{b.text}</p>
              </div>
            ))}
          </div>

          {/* Anchor line */}
          <div
            style={{
              background: COLORS.warningLight,
              borderRadius: 10,
              padding: "14px 18px",
              marginBottom: 28,
              border: `1px solid rgba(212, 168, 67, 0.15)`,
            }}
          >
            <p style={{ fontSize: "0.9375rem", lineHeight: 1.55, color: COLORS.textPrimary }}>
              One week of IRD emergency tax costs ~<strong style={{ fontWeight: 600 }}>$240</strong>.{" "}
              <span style={{ color: COLORS.primary, fontWeight: 600 }}>Six months of LandedNZ costs $49.</span>
            </p>
          </div>

          {/* Three paths */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
            {/* 1. Upgrade */}
            <button
              className="upgrade-btn"
              onClick={onUpgrade}
              style={{
                width: "100%",
                padding: "15px 24px",
                borderRadius: 10,
                background: COLORS.primary,
                color: COLORS.textInverse,
                fontSize: "0.9375rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              Continue with Premium — $49 for 6 months
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>

            {/* 2. Defer */}
            <button
              className="defer-btn"
              onClick={onDefer}
              style={{
                width: "100%",
                padding: "13px 24px",
                borderRadius: 10,
                background: "transparent",
                border: `1.5px solid ${COLORS.border}`,
                color: COLORS.primary,
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              Remind me in 24 hours
            </button>

            {/* 3. Decline */}
            <button
              className="decline-link"
              onClick={onDecline}
              style={{
                padding: "8px 16px",
                fontSize: "0.8125rem",
                color: COLORS.textTertiary,
              }}
            >
              Stay on the free plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Collapsed Banner (after decline) ───
function PremiumBanner({ onDismiss }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 16px",
        borderRadius: 8,
        background: COLORS.secondaryLight,
        border: `1px solid rgba(212, 168, 67, 0.2)`,
        marginBottom: 10,
        animation: "fadeIn 0.3s ease-out",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" stroke={COLORS.premiumGold} strokeWidth="1.5" fill="rgba(212, 168, 67, 0.2)" strokeLinejoin="round" />
        </svg>
        <span style={{ fontSize: "0.8125rem", color: COLORS.textPrimary }}>
          Premium unlocks your full roadmap — $49 for 6 months
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button className="banner-upgrade" style={{ fontSize: "0.8125rem", fontWeight: 600, color: COLORS.primary, padding: 0 }}>
          Learn more
        </button>
        <button className="banner-close" onClick={onDismiss} style={{ padding: 4, color: COLORS.textTertiary }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
      </div>
    </div>
  );
}

// ─── Main Screen ───
export default function PremiumGateScreen() {
  const [gateState, setGateState] = useState("full"); // full | banner | dismissed

  // Last free tasks (Phase 2)
  const phase2Tasks = [
    { name: "Register with a GP (doctor)", consequence: "Walk-in visits cost $50–80. Enrolled patients pay $20–40.", time: "30 min", status: "not_started" },
    { name: "Get an AT HOP card", consequence: "Cash fares are 25% more expensive than HOP card fares.", time: "15 min", status: "not_started" },
    { name: "Convert your driving licence", consequence: "Your overseas licence is valid for 12 months only.", time: "1–2 hrs", status: "not_started" },
    { name: "Set up money transfers home", consequence: "Wise saves $300–600/year vs bank transfers.", time: "20 min", status: "not_started" },
  ];

  // Premium tasks (Phase 3 teaser)
  const phase3Tasks = [
    { name: "Choose a KiwiSaver provider", consequence: "Your employer contributes 3% — that's $2,000+/year free money.", status: "premium_locked" },
    { name: "Understand your tenancy rights", consequence: "Knowing bond rules prevents disputes that cost $500+.", status: "premium_locked" },
    { name: "Plan for residency pathway", consequence: "Missing the 24-month threshold means restarting your visa process.", status: "premium_locked" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: COLORS.bg }}>
      <style>{styleSheet}</style>

      {/* Sidebar */}
      <div style={{ width: 256, background: COLORS.bgSidebar, borderRight: `1px solid ${COLORS.border}`, flexShrink: 0, overflowY: "auto", position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 20px 20px" }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: COLORS.secondary, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke={COLORS.textPrimary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.125rem", color: COLORS.textPrimary }}>LandedNZ</span>
        </div>

        <div style={{ padding: "0 12px" }}>
          {[
            { label: "Roadmap", active: true, icon: "◉" },
            { label: "Chat", active: false, icon: "💬" },
            { label: "Settings", active: false, icon: "⚙" },
          ].map((item) => (
            <button key={item.label} className="sidebar-item" style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, fontSize: "0.875rem", fontWeight: item.active ? 600 : 400, color: item.active ? COLORS.primary : COLORS.textSecondary, background: item.active ? COLORS.primaryLight : "transparent", borderLeft: item.active ? `3px solid ${COLORS.primary}` : "3px solid transparent" }}>
              <span style={{ fontSize: "0.9rem", width: 20, textAlign: "center" }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        <div style={{ padding: "16px 20px 8px" }}>
          <span style={{ fontSize: "0.6875rem", fontWeight: 500, color: COLORS.textTertiary, textTransform: "uppercase", letterSpacing: "0.08em" }}>Your plan</span>
        </div>
        <div style={{ padding: "0 12px" }}>
          {[
            { name: "Phase 1: Before work", count: "4/4", done: true },
            { name: "Phase 2: First 2 weeks", count: "0/4", done: false },
            { name: "Phase 3: Settling in", count: "", premium: true },
          ].map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 6, fontSize: "0.8125rem", color: COLORS.textSecondary, fontWeight: 500 }}>
              <span style={{ fontSize: "0.7rem", color: COLORS.textTertiary }}>▶</span>
              <span style={{ flex: 1 }}>{ p.name }</span>
              {p.premium ? (
                <span style={{ fontSize: "0.6875rem", background: COLORS.secondaryLight, color: COLORS.secondaryHover, padding: "2px 8px", borderRadius: 100, fontWeight: 500 }}>Premium</span>
              ) : (
                <span style={{ fontSize: "0.75rem", color: p.done ? COLORS.success : COLORS.textTertiary }}>{p.count} {p.done && "✓"}</span>
              )}
            </div>
          ))}
        </div>

        {/* User footer */}
        <div style={{ borderTop: `1px solid ${COLORS.border}`, padding: "14px 20px", marginTop: "auto", position: "absolute", bottom: 0, left: 0, right: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: COLORS.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 600, color: COLORS.primary }}>P</div>
            <div>
              <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: COLORS.textPrimary }}>Priya & Karthik</div>
              <div style={{ fontSize: "0.6875rem", color: COLORS.textTertiary }}>Partner of Student Visa · Auckland</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "28px 40px 60px", overflowY: "auto", maxWidth: 960 }}>

        {/* Phase 2 header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 8px", marginBottom: 6 }}>
          <span style={{ fontSize: "0.65rem", color: COLORS.textTertiary, transform: "rotate(90deg)" }}>▶</span>
          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: COLORS.textPrimary }}>Phase 2: First 2 weeks</span>
          <span style={{ fontSize: "0.75rem", color: COLORS.textTertiary }}>· Weeks 1–2</span>
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: "0.75rem", color: COLORS.textTertiary }}>0/4</span>
        </div>

        {phase2Tasks.map((t, i) => (
          <TaskRow key={i} task={t} />
        ))}

        {/* ═══ THE PREMIUM BOUNDARY ═══ */}
        <div style={{ height: 20 }} />

        {/* Phase 3 header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 8px", marginBottom: 6 }}>
          <span style={{ fontSize: "0.65rem", color: COLORS.textTertiary, transform: "rotate(90deg)" }}>▶</span>
          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: COLORS.textPrimary }}>Phase 3: Settling in</span>
          <span style={{ fontSize: "0.75rem", color: COLORS.textTertiary }}>· Weeks 3–8</span>
          <span style={{ fontSize: "0.6875rem", background: COLORS.secondaryLight, color: COLORS.secondaryHover, padding: "2px 8px", borderRadius: 100, fontWeight: 500, marginLeft: 4 }}>Premium</span>
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: "0.75rem", color: COLORS.textTertiary }}>0/3</span>
        </div>

        {/* Collapsed banner (after decline) */}
        {gateState === "banner" && (
          <PremiumBanner onDismiss={() => setGateState("dismissed")} />
        )}

        {/* Premium teaser tasks */}
        {phase3Tasks.map((t, i) => (
          <TaskRow key={`p3-${i}`} task={t} />
        ))}

        {/* Gate card (full state) */}
        {gateState === "full" && (
          <>
            <div style={{ height: 12 }} />
            <PremiumGateCard
              onUpgrade={() => alert("→ Stripe Checkout")}
              onDefer={() => {
                setGateState("banner");
              }}
              onDecline={() => {
                setGateState("banner");
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}

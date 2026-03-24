import { useState, useEffect, useRef } from "react";

// LandedNZ Roadmap Dashboard — Screen 3
// Decisions: Teal hero card, Linear-style content replacement, hybrid task rows
// Sidebar + Content — always two windows, nothing else.

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
  errorLight: "#FDF0EE",
  blocked: "#8E8E9A",
  blockedLight: "#F2F2F4",
  premiumGold: "#D4A843",
  border: "#E5E3E0",
  borderHover: "#D0CEC8",
};

// ─── Sample Data ───
const TASKS = [
  {
    id: "t1",
    name: "Get a NZ SIM card",
    consequence: "Without a local number, you can't verify bank accounts or receive employer calls.",
    time: "30 min",
    difficulty: "Easy",
    status: "complete",
    phase: 1,
    completedDate: "Mar 15",
  },
  {
    id: "t2",
    name: "Open a bank account",
    consequence: "You need this to receive paychecks — most employers require direct deposit within week one.",
    time: "1–2 hrs",
    difficulty: "Medium",
    status: "complete",
    phase: 1,
    completedDate: "Mar 17",
  },
  {
    id: "t3",
    name: "Apply for your IRD number",
    consequence: "Without this, your first paycheck is taxed at 45% — the emergency rate.",
    time: "20 min",
    difficulty: "Easy",
    status: "in_progress",
    phase: 1,
    detail: {
      whyNow:
        "Without an IRD number, your employer must deduct tax at the highest rate — 45% instead of your actual rate (likely 17.5% or 30%). That's $300–400 lost per paycheck until it's sorted.",
      steps: [
        { text: "Go to the IRD website and select 'Apply for an IRD number'" },
        { text: "Choose 'Individual' and confirm you have a valid NZ visa" },
        { text: "Enter your passport details and NZ address" },
        { text: "Provide your NZ bank account number (from Task 2)" },
        { text: "Submit — your IRD number arrives by post in 8–10 working days" },
      ],
      documents: [
        { name: "Passport", required: true },
        { name: "NZ visa (e-visa or label)", required: true },
        { name: "NZ bank account number", required: true },
        { name: "NZ address (rental or temporary)", required: true },
        { name: "Overseas tax ID (optional)", required: false },
      ],
      source: { agency: "Inland Revenue (IRD)", page: "Apply for an IRD number", url: "ird.govt.nz" },
      tips: [
        "Apply online — it's faster than the paper form.",
        "You can start work before getting your IRD number, but tell your employer as soon as it arrives.",
        "If you're on a Partner visa, you still need your own IRD number.",
      ],
    },
  },
  {
    id: "t4",
    name: "Submit your tax code declaration",
    consequence: "Your employer can't calculate your correct tax rate until this form is filed.",
    time: "10 min",
    difficulty: "Easy",
    status: "not_started",
    phase: 1,
    blocked: false,
  },
  {
    id: "t5",
    name: "Register with a GP (doctor)",
    consequence: "Walk-in visits cost $50–80. Enrolled patients pay $20–40 and get subsidised prescriptions.",
    time: "30 min",
    difficulty: "Easy",
    status: "not_started",
    phase: 2,
  },
  {
    id: "t6",
    name: "Get an AT HOP card",
    consequence: "Cash fares are 25% more expensive than HOP card fares on Auckland buses and trains.",
    time: "15 min",
    difficulty: "Easy",
    status: "not_started",
    phase: 2,
  },
  {
    id: "t7",
    name: "Convert your driving licence",
    consequence: "Your overseas licence is valid for 12 months only — after that, driving uninsured is a $400 fine.",
    time: "1–2 hrs",
    difficulty: "Medium",
    status: "not_started",
    phase: 2,
  },
  {
    id: "t8",
    name: "Set up money transfers home",
    consequence: "Bank transfers cost $25–40 per transaction plus poor exchange rates. Wise saves $300–600/year.",
    time: "20 min",
    difficulty: "Easy",
    status: "blocked",
    phase: 2,
    blockedBy: "Open a bank account",
  },
  {
    id: "t9",
    name: "Choose a KiwiSaver provider",
    consequence: "Your employer contributes 3% of your salary — but only if you're enrolled. That's $2,000+/year free money.",
    time: "30 min",
    difficulty: "Medium",
    status: "premium_locked",
    phase: 3,
  },
  {
    id: "t10",
    name: "Understand your tenancy rights",
    consequence: "Knowing bond rules, notice periods, and inspection rights prevents disputes that cost $500+.",
    time: "15 min",
    difficulty: "Easy",
    status: "premium_locked",
    phase: 3,
  },
  {
    id: "t11",
    name: "Plan for residency pathway",
    consequence: "Missing the 24-month skilled worker threshold means restarting your visa process from scratch.",
    time: "45 min",
    difficulty: "Hard",
    status: "premium_locked",
    phase: 3,
  },
];

const PHASES = [
  { num: 1, name: "Before you start working", timeline: "Week 1", tasks: TASKS.filter((t) => t.phase === 1) },
  { num: 2, name: "First 2 weeks", timeline: "Weeks 1–2", tasks: TASKS.filter((t) => t.phase === 2) },
  { num: 3, name: "Settling in", timeline: "Weeks 3–8", tasks: TASKS.filter((t) => t.phase === 3), premium: true },
];

const styleSheet = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Serif+Display&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }
  body, html {
    font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    -webkit-font-smoothing: antialiased;
    background: ${COLORS.bg};
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }

  .task-row {
    transition: all 0.15s ease;
    cursor: pointer;
  }
  .task-row:hover {
    border-color: ${COLORS.borderHover} !important;
    background: ${COLORS.primarySubtle} !important;
  }
  .task-row:active {
    background: ${COLORS.primaryLight} !important;
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

  .filter-tab {
    transition: all 0.12s ease;
    cursor: pointer;
    border: none;
    outline: none;
    background: transparent;
  }
  .filter-tab:hover {
    color: ${COLORS.textPrimary} !important;
  }

  .phase-header {
    transition: all 0.12s ease;
    cursor: pointer;
  }
  .phase-header:hover {
    background: rgba(0,0,0,0.02);
  }

  .back-btn {
    transition: all 0.15s ease;
    cursor: pointer;
    border: none;
    background: transparent;
  }
  .back-btn:hover {
    color: ${COLORS.primaryHover} !important;
    transform: translateX(-2px);
  }

  .action-btn-primary {
    transition: all 0.15s ease;
    cursor: pointer;
    border: none;
  }
  .action-btn-primary:hover {
    background: ${COLORS.primaryHover} !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(27, 107, 109, 0.25);
  }

  .action-btn-secondary {
    transition: all 0.15s ease;
    cursor: pointer;
  }
  .action-btn-secondary:hover {
    background: ${COLORS.primarySubtle} !important;
  }

  .tip-item {
    transition: all 0.1s ease;
  }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 3px; }
`;

// ─── Status Icon Component ───
function StatusIcon({ status, size = 18 }) {
  const s = size;
  if (status === "complete")
    return (
      <div
        style={{
          width: s, height: s, borderRadius: "50%", background: COLORS.success,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}
      >
        <svg width={s * 0.6} height={s * 0.6} viewBox="0 0 24 24" fill="none">
          <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  if (status === "in_progress")
    return (
      <div
        style={{
          width: s, height: s, borderRadius: "50%", border: `2px solid ${COLORS.primary}`,
          background: `conic-gradient(${COLORS.primary} 0deg 180deg, transparent 180deg 360deg)`,
          flexShrink: 0,
        }}
      />
    );
  if (status === "blocked")
    return (
      <div
        style={{
          width: s, height: s, borderRadius: "50%", background: COLORS.blockedLight,
          border: `1.5px solid ${COLORS.blocked}`,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}
      >
        <svg width={s * 0.55} height={s * 0.55} viewBox="0 0 24 24" fill="none">
          <rect x="3" y="11" width="18" height="11" rx="2" stroke={COLORS.blocked} strokeWidth="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" stroke={COLORS.blocked} strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    );
  if (status === "premium_locked")
    return (
      <div
        style={{
          width: s, height: s, borderRadius: "50%", background: COLORS.secondaryLight,
          border: `1.5px solid ${COLORS.premiumGold}`,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}
      >
        <svg width={s * 0.55} height={s * 0.55} viewBox="0 0 24 24" fill="none">
          <rect x="3" y="11" width="18" height="11" rx="2" stroke={COLORS.premiumGold} strokeWidth="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" stroke={COLORS.premiumGold} strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    );
  // not_started
  return (
    <div
      style={{
        width: s, height: s, borderRadius: "50%",
        border: `2px solid ${COLORS.border}`, flexShrink: 0,
      }}
    />
  );
}

// ─── Sidebar ───
function Sidebar({ activeNav, onNavChange }) {
  const [expandedPhases, setExpandedPhases] = useState([1]);

  const togglePhase = (num) => {
    setExpandedPhases((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );
  };

  const navItems = [
    { id: "roadmap", label: "Roadmap", icon: "◉" },
    { id: "chat", label: "Chat", icon: "💬" },
    { id: "settings", label: "Settings", icon: "⚙" },
  ];

  return (
    <div
      style={{
        width: 256,
        height: "100vh",
        background: COLORS.bgSidebar,
        borderRight: `1px solid ${COLORS.border}`,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        overflowY: "auto",
        position: "sticky",
        top: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "20px 20px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 30, height: 30, borderRadius: 8, background: COLORS.secondary,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke={COLORS.textPrimary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.125rem", color: COLORS.textPrimary }}>
          LandedNZ
        </span>
      </div>

      {/* Primary Nav */}
      <div style={{ padding: "0 12px", marginBottom: 8 }}>
        {navItems.map((item) => (
          <button
            key={item.id}
            className="sidebar-item"
            onClick={() => onNavChange(item.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 12px",
              borderRadius: 8,
              fontSize: "0.875rem",
              fontWeight: activeNav === item.id ? 600 : 400,
              color: activeNav === item.id ? COLORS.primary : COLORS.textSecondary,
              background: activeNav === item.id ? COLORS.primaryLight : "transparent",
              borderLeft: activeNav === item.id ? `3px solid ${COLORS.primary}` : "3px solid transparent",
            }}
          >
            <span style={{ fontSize: "0.9rem", width: 20, textAlign: "center" }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      {/* Divider + YOUR PLAN */}
      <div style={{ padding: "12px 20px 8px" }}>
        <span style={{ fontSize: "0.6875rem", fontWeight: 500, color: COLORS.textTertiary, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Your plan
        </span>
      </div>

      {/* Phase sections */}
      <div style={{ padding: "0 12px", flex: 1 }}>
        {PHASES.map((phase) => {
          const completed = phase.tasks.filter((t) => t.status === "complete").length;
          const expanded = expandedPhases.includes(phase.num);
          return (
            <div key={phase.num} style={{ marginBottom: 4 }}>
              <div
                className="phase-header"
                onClick={() => togglePhase(phase.num)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 12px",
                  borderRadius: 6,
                  fontSize: "0.8125rem",
                  color: COLORS.textSecondary,
                  fontWeight: 500,
                }}
              >
                <span style={{ fontSize: "0.7rem", color: COLORS.textTertiary, transition: "transform 0.15s", transform: expanded ? "rotate(90deg)" : "rotate(0)" }}>▶</span>
                <span style={{ flex: 1 }}>Phase {phase.num}: {phase.name}</span>
                {phase.premium && (
                  <span style={{ fontSize: "0.6875rem", background: COLORS.secondaryLight, color: COLORS.secondaryHover, padding: "2px 8px", borderRadius: 100, fontWeight: 500 }}>
                    Premium
                  </span>
                )}
                {!phase.premium && (
                  <span style={{ fontSize: "0.75rem", color: COLORS.textTertiary }}>{completed}/{phase.tasks.length}</span>
                )}
              </div>
              {expanded && !phase.premium && (
                <div style={{ paddingLeft: 24, paddingBottom: 4 }}>
                  {phase.tasks.map((task) => (
                    <div
                      key={task.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "5px 8px",
                        fontSize: "0.8125rem",
                        color: task.status === "complete" ? COLORS.textTertiary : COLORS.textSecondary,
                        borderRadius: 4,
                        cursor: "pointer",
                      }}
                    >
                      <StatusIcon status={task.status} size={14} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Divider + HELP */}
      <div style={{ padding: "12px 20px 8px" }}>
        <span style={{ fontSize: "0.6875rem", fontWeight: 500, color: COLORS.textTertiary, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Help
        </span>
      </div>
      <div style={{ padding: "0 12px 16px" }}>
        <button className="sidebar-item" style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 12px", borderRadius: 8, fontSize: "0.8125rem", color: COLORS.textSecondary }}>
          <span style={{ fontSize: "0.85rem", width: 20, textAlign: "center" }}>📖</span> Resources
        </button>
        <button className="sidebar-item" style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 12px", borderRadius: 8, fontSize: "0.8125rem", color: COLORS.textSecondary }}>
          <span style={{ fontSize: "0.85rem", width: 20, textAlign: "center" }}>📧</span> Feedback
        </button>
      </div>

      {/* User footer */}
      <div
        style={{
          borderTop: `1px solid ${COLORS.border}`,
          padding: "14px 20px",
          marginTop: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div
            style={{
              width: 32, height: 32, borderRadius: "50%", background: COLORS.primaryLight,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.75rem", fontWeight: 600, color: COLORS.primary,
            }}
          >
            P
          </div>
          <div>
            <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: COLORS.textPrimary }}>Priya & Karthik</div>
            <div style={{ fontSize: "0.6875rem", color: COLORS.textTertiary }}>Partner of Student Visa · Auckland</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Task Row Component ───
function TaskRow({ task, onClick, priority = false }) {
  const isComplete = task.status === "complete";
  const isBlocked = task.status === "blocked";
  const isPremium = task.status === "premium_locked";
  const isMuted = isComplete || isBlocked;

  return (
    <div
      className="task-row"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: priority ? "14px 16px" : "11px 16px",
        borderRadius: 10,
        border: `1px solid ${COLORS.border}`,
        background: isBlocked
          ? COLORS.blockedLight
          : isPremium
            ? COLORS.bgCard
            : COLORS.bgCard,
        marginBottom: 6,
        opacity: isComplete ? 0.7 : 1,
        borderLeft: task.status === "in_progress" ? `3px solid ${COLORS.primary}` : isPremium ? `3px solid ${COLORS.premiumGold}` : `1px solid ${COLORS.border}`,
      }}
    >
      <StatusIcon status={task.status} size={18} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "0.9375rem",
            fontWeight: isMuted ? 400 : 500,
            color: isMuted ? COLORS.textSecondary : COLORS.textPrimary,
            lineHeight: 1.4,
            marginBottom: 2,
          }}
        >
          {task.name}
        </div>
        <div
          style={{
            fontSize: "0.8125rem",
            color: COLORS.textTertiary,
            lineHeight: 1.4,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: priority ? "normal" : "nowrap",
          }}
        >
          {isComplete
            ? `Completed ${task.completedDate}`
            : isBlocked
              ? `Needs: ${task.blockedBy}`
              : task.consequence}
        </div>
      </div>

      {/* Right metadata */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {!isComplete && !isBlocked && !isPremium && task.time && (
          <span
            style={{
              fontSize: "0.75rem",
              color: COLORS.textTertiary,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke={COLORS.textTertiary} strokeWidth="1.5" />
              <path d="M12 6v6l4 2" stroke={COLORS.textTertiary} strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {task.time}
          </span>
        )}
        {isPremium && (
          <span
            style={{
              fontSize: "0.6875rem",
              fontWeight: 500,
              background: COLORS.secondaryLight,
              color: COLORS.secondaryHover,
              padding: "3px 10px",
              borderRadius: 100,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="11" width="18" height="11" rx="2" stroke={COLORS.premiumGold} strokeWidth="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" stroke={COLORS.premiumGold} strokeWidth="2" strokeLinecap="round" />
            </svg>
            Premium
          </span>
        )}
        {!isComplete && !isPremium && task.difficulty && (
          <span
            style={{
              fontSize: "0.6875rem",
              fontWeight: 500,
              padding: "3px 8px",
              borderRadius: 100,
              background:
                task.difficulty === "Easy"
                  ? COLORS.successLight
                  : task.difficulty === "Hard"
                    ? COLORS.errorLight
                    : COLORS.warningLight,
              color:
                task.difficulty === "Easy"
                  ? COLORS.success
                  : task.difficulty === "Hard"
                    ? COLORS.error
                    : COLORS.warning,
            }}
          >
            {task.difficulty}
          </span>
        )}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.3 }}>
          <path d="M9 18l6-6-6-6" stroke={COLORS.textTertiary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

// ─── Hero Progress Card ───
function HeroCard() {
  const completed = TASKS.filter((t) => t.status === "complete").length;
  const total = TASKS.length;
  const pct = Math.round((completed / total) * 100);
  const circumference = 2 * Math.PI * 30;
  const dashOffset = circumference - (pct / 100) * circumference;
  const inProgress = TASKS.filter((t) => t.status === "in_progress").length;
  const remaining = total - completed - inProgress;

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${COLORS.primary} 0%, #145254 100%)`,
        borderRadius: 12,
        padding: "22px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 24,
      }}
    >
      <div>
        <p style={{ fontSize: "1.25rem", fontWeight: 500, color: COLORS.textInverse, marginBottom: 4, fontFamily: "'DM Serif Display', serif" }}>
          Hi Priya
        </p>
        <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.75)", marginBottom: 10 }}>
          Your First 90 Days in New Zealand
        </p>
        <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.5)" }}>
          {completed} completed · {inProgress} in progress · {remaining} remaining
        </p>
      </div>
      <div style={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="5" />
          <circle
            cx="36" cy="36" r="30" fill="none"
            stroke={COLORS.secondary}
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform="rotate(-90 36 36)"
            style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: "1.125rem", fontWeight: 600, color: COLORS.textInverse }}>{pct}%</span>
        </div>
      </div>
    </div>
  );
}

// ─── Task Detail View (replaces list — Linear pattern) ───
function TaskDetail({ task, onBack }) {
  const d = task.detail;
  const [showTips, setShowTips] = useState(false);

  return (
    <div style={{ animation: "slideInRight 0.3s ease-out", maxWidth: 720 }}>
      {/* Back + breadcrumb */}
      <button
        className="back-btn"
        onClick={onBack}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: "0.875rem",
          fontWeight: 500,
          color: COLORS.primary,
          marginBottom: 24,
          padding: "4px 0",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to roadmap
      </button>

      {/* Task header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          <StatusIcon status={task.status} size={22} />
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.5rem", fontWeight: 400, color: COLORS.textPrimary }}>
            {task.name}
          </h1>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 500, padding: "4px 12px", borderRadius: 100, background: COLORS.primaryLight, color: COLORS.primary }}>
            Phase {task.phase}
          </span>
          {task.time && (
            <span style={{ fontSize: "0.75rem", fontWeight: 500, padding: "4px 12px", borderRadius: 100, background: COLORS.bg, color: COLORS.textSecondary, display: "flex", alignItems: "center", gap: 4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" /><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              {task.time}
            </span>
          )}
          {task.difficulty && (
            <span
              style={{
                fontSize: "0.75rem", fontWeight: 500, padding: "4px 12px", borderRadius: 100,
                background: task.difficulty === "Easy" ? COLORS.successLight : task.difficulty === "Hard" ? COLORS.errorLight : COLORS.warningLight,
                color: task.difficulty === "Easy" ? COLORS.success : task.difficulty === "Hard" ? COLORS.error : COLORS.warning,
              }}
            >
              {task.difficulty}
            </span>
          )}
        </div>
      </div>

      {/* Why This Matters Now */}
      {d?.whyNow && (
        <div
          style={{
            background: COLORS.warningLight,
            borderLeft: `3px solid ${COLORS.warning}`,
            borderRadius: "0 10px 10px 0",
            padding: "16px 20px",
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke={COLORS.warning} strokeWidth="1.5" />
              <path d="M12 8v4M12 16h.01" stroke={COLORS.warning} strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: COLORS.secondaryHover }}>
              Why this matters now
            </span>
          </div>
          <p style={{ fontSize: "0.9375rem", lineHeight: 1.65, color: COLORS.textPrimary }}>
            {d.whyNow}
          </p>
        </div>
      )}

      {/* How This Works */}
      {d?.steps && (
        <div style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, color: COLORS.textPrimary, marginBottom: 14 }}>
            How this works
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {d.steps.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 12, position: "relative" }}>
                {/* Connector line */}
                {i < d.steps.length - 1 && (
                  <div style={{ position: "absolute", left: 13, top: 28, bottom: -4, width: 1, background: COLORS.border }} />
                )}
                {/* Number */}
                <div
                  style={{
                    width: 28, height: 28, borderRadius: "50%", background: COLORS.primaryLight,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.75rem", fontWeight: 600, color: COLORS.primary, flexShrink: 0, zIndex: 1,
                  }}
                >
                  {i + 1}
                </div>
                <p style={{ fontSize: "0.9375rem", lineHeight: 1.6, color: COLORS.textPrimary, paddingTop: 3, paddingBottom: 16 }}>
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents Needed */}
      {d?.documents && (
        <div style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, color: COLORS.textPrimary, marginBottom: 12 }}>
            Documents you'll need
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {d.documents.map((doc, i) => (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 12px", borderRadius: 8, background: COLORS.bg,
                }}
              >
                <div
                  style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: doc.required ? COLORS.primary : "transparent",
                    border: doc.required ? "none" : `1.5px solid ${COLORS.textTertiary}`,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: "0.875rem", color: COLORS.textPrimary, flex: 1 }}>
                  {doc.name}
                </span>
                {!doc.required && (
                  <span style={{ fontSize: "0.75rem", color: COLORS.textTertiary, fontStyle: "italic" }}>
                    optional
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Official Source */}
      {d?.source && (
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 18px", borderRadius: 10,
            border: `1px solid ${COLORS.border}`, background: COLORS.bgCard,
            marginBottom: 24,
          }}
        >
          <div>
            <div style={{ fontSize: "0.75rem", color: COLORS.textTertiary, marginBottom: 2, fontWeight: 500 }}>
              Official source
            </div>
            <div style={{ fontSize: "0.9375rem", fontWeight: 500, color: COLORS.textPrimary }}>
              {d.source.agency}
            </div>
            <div style={{ fontSize: "0.8125rem", color: COLORS.textSecondary }}>
              {d.source.page}
            </div>
          </div>
          <div
            style={{
              background: COLORS.successLight, color: COLORS.success,
              padding: "8px 16px", borderRadius: 8, fontSize: "0.8125rem", fontWeight: 600,
              display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            Go to {d.source.url}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      )}

      {/* Helpful Tips (collapsible) */}
      {d?.tips && (
        <div style={{ marginBottom: 28 }}>
          <div
            onClick={() => setShowTips(!showTips)}
            style={{
              display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
              padding: "10px 0", borderTop: `1px solid ${COLORS.border}`,
            }}
          >
            <span style={{ fontSize: "0.7rem", color: COLORS.textTertiary, transition: "transform 0.15s", transform: showTips ? "rotate(90deg)" : "rotate(0)" }}>▶</span>
            <span style={{ fontSize: "0.9375rem", fontWeight: 600, color: COLORS.textPrimary }}>
              Helpful tips
            </span>
          </div>
          {showTips && (
            <div style={{ paddingLeft: 4, paddingTop: 8, display: "flex", flexDirection: "column", gap: 8, animation: "fadeIn 0.2s ease-out" }}>
              {d.tips.map((tip, i) => (
                <div key={i} className="tip-item" style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: "0.75rem", color: COLORS.secondary, marginTop: 4 }}>💡</span>
                  <p style={{ fontSize: "0.875rem", lineHeight: 1.55, color: COLORS.textSecondary }}>{tip}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ask a question */}
      <button
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "10px 18px", borderRadius: 8,
          border: `1px solid ${COLORS.border}`, background: COLORS.bgCard,
          fontSize: "0.875rem", fontWeight: 500, color: COLORS.textSecondary,
          cursor: "pointer", marginBottom: 20, transition: "all 0.15s ease", width: "100%", justifyContent: "center",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.primary; e.currentTarget.style.color = COLORS.primary; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = COLORS.textSecondary; }}
      >
        💬 Ask a question about this task
      </button>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          className="action-btn-primary"
          style={{
            flex: 1, padding: "14px 24px", borderRadius: 10,
            background: COLORS.primary, color: COLORS.textInverse,
            fontSize: "0.9375rem", fontWeight: 600,
          }}
        >
          Mark as done
        </button>
        <button
          className="action-btn-secondary"
          style={{
            padding: "14px 24px", borderRadius: 10,
            background: "transparent", border: `1.5px solid ${COLORS.border}`,
            fontSize: "0.9375rem", fontWeight: 500, color: COLORS.textSecondary,
          }}
        >
          I've already done this
        </button>
      </div>
    </div>
  );
}

// ─── Roadmap List View ───
function RoadmapList({ onTaskClick }) {
  const [filter, setFilter] = useState("all");
  const [expandedPhases, setExpandedPhases] = useState([1, 2]);

  const filters = [
    { id: "all", label: "All tasks" },
    { id: "todo", label: "To do" },
    { id: "progress", label: "In progress" },
    { id: "done", label: "Done" },
  ];

  const togglePhase = (num) => {
    setExpandedPhases((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );
  };

  const filterTasks = (tasks) => {
    if (filter === "todo") return tasks.filter((t) => t.status === "not_started" || t.status === "blocked");
    if (filter === "progress") return tasks.filter((t) => t.status === "in_progress");
    if (filter === "done") return tasks.filter((t) => t.status === "complete");
    return tasks;
  };

  // Priority tasks: top 3 uncompleted, non-blocked, non-premium
  const priorityTasks = TASKS.filter(
    (t) => t.status !== "complete" && t.status !== "blocked" && t.status !== "premium_locked"
  ).slice(0, 3);

  return (
    <div>
      <HeroCard />

      {/* Do these first */}
      {filter === "all" && (
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, color: COLORS.textPrimary, marginBottom: 10 }}>
            Do these first
          </h2>
          {priorityTasks.map((task) => (
            <TaskRow key={task.id} task={task} onClick={() => onTaskClick(task)} priority />
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 0 }}>
        {filters.map((f) => (
          <button
            key={f.id}
            className="filter-tab"
            onClick={() => setFilter(f.id)}
            style={{
              padding: "8px 14px",
              fontSize: "0.8125rem",
              fontWeight: filter === f.id ? 600 : 400,
              color: filter === f.id ? COLORS.primary : COLORS.textTertiary,
              borderBottom: filter === f.id ? `2px solid ${COLORS.primary}` : "2px solid transparent",
              marginBottom: -1,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Phase sections */}
      {PHASES.map((phase) => {
        const tasks = filterTasks(phase.tasks);
        if (tasks.length === 0 && filter !== "all") return null;
        const expanded = expandedPhases.includes(phase.num);

        return (
          <div key={phase.num} style={{ marginBottom: 16 }}>
            <div
              className="phase-header"
              onClick={() => togglePhase(phase.num)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 8px",
                borderRadius: 6,
              }}
            >
              <span style={{ fontSize: "0.65rem", color: COLORS.textTertiary, transition: "transform 0.15s", transform: expanded ? "rotate(90deg)" : "rotate(0)" }}>▶</span>
              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: COLORS.textPrimary }}>
                Phase {phase.num}: {phase.name}
              </span>
              <span style={{ fontSize: "0.75rem", color: COLORS.textTertiary }}>
                · {phase.timeline}
              </span>
              {phase.premium && (
                <span style={{ fontSize: "0.6875rem", background: COLORS.secondaryLight, color: COLORS.secondaryHover, padding: "2px 8px", borderRadius: 100, fontWeight: 500, marginLeft: 4 }}>
                  Premium
                </span>
              )}
              <span style={{ flex: 1 }} />
              <span style={{ fontSize: "0.75rem", color: COLORS.textTertiary }}>
                {phase.tasks.filter((t) => t.status === "complete").length}/{phase.tasks.length}
              </span>
            </div>

            {expanded && (
              <div style={{ paddingTop: 4 }}>
                {(filter === "all" ? phase.tasks : tasks).map((task) => (
                  <TaskRow key={task.id} task={task} onClick={() => onTaskClick(task)} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main App ───
export default function RoadmapDashboard() {
  const [activeNav, setActiveNav] = useState("roadmap");
  const [selectedTask, setSelectedTask] = useState(null);

  const handleTaskClick = (task) => {
    if (task.detail) {
      setSelectedTask(task);
    }
  };

  const handleBack = () => {
    setSelectedTask(null);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: COLORS.bg }}>
      <style>{styleSheet}</style>

      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />

      {/* Content area */}
      <div
        style={{
          flex: 1,
          padding: "28px 40px 60px",
          overflowY: "auto",
          maxWidth: 960,
        }}
      >
        {selectedTask ? (
          <TaskDetail task={selectedTask} onBack={handleBack} />
        ) : (
          <RoadmapList onTaskClick={handleTaskClick} />
        )}
      </div>
    </div>
  );
}

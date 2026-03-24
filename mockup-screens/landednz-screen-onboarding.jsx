import { useState, useEffect, useRef } from "react";

// LandedNZ Onboarding Flow — Screen 2
// Design ref: 14-ui-ux-design.md (Screen 2), 13-ui-ux-research.md
// Pattern: Duolingo conversational + Notion progressive reveal
// Tone: Warm, conversational — "First — what brings you to New Zealand?"

const COLORS = {
  primary: "#1B6B6D",
  primaryHover: "#15585A",
  primaryLight: "#E8F4F4",
  primarySubtle: "#F0F8F8",
  secondary: "#D4A843",
  secondaryLight: "#FDF6E7",
  bg: "#F8F6F3",
  bgCard: "#FFFFFF",
  textPrimary: "#1A1A2E",
  textSecondary: "#5A5A6E",
  textTertiary: "#8E8E9A",
  textInverse: "#FFFFFF",
  success: "#2D8A5E",
  successLight: "#E8F5EE",
  border: "#E5E3E0",
  borderHover: "#D0CEC8",
  borderFocus: "#1B6B6D",
};

const questions = [
  {
    id: "visa",
    question: "First — what brings you to New Zealand?",
    subtitle: "This determines which tasks and deadlines apply to you.",
    options: [
      {
        value: "aewv",
        label: "Accredited Employer Work Visa",
        desc: "Sponsored by a NZ employer",
        icon: "💼",
      },
      {
        value: "partner_student",
        label: "Partner of a Student or Worker",
        desc: "Your partner holds the primary visa",
        icon: "👫",
      },
      {
        value: "green_list",
        label: "Green List Work Visa",
        desc: "Skilled role on the Green List",
        icon: "📋",
      },
      {
        value: "green_residence",
        label: "Green List — Straight to Residence",
        desc: "Qualifying for residence on arrival",
        icon: "🏡",
      },
      {
        value: "other",
        label: "Other or not sure yet",
        desc: "We'll give you a general plan",
        icon: "🧭",
      },
    ],
  },
  {
    id: "city",
    question: "Which city are you arriving in?",
    subtitle: "Local details like transport, housing areas, and services vary by city.",
    options: [
      { value: "auckland", label: "Auckland", desc: "Largest city, most newcomers land here", icon: "🌊" },
      { value: "wellington", label: "Wellington", desc: "Capital city, compact and walkable", icon: "🏛️" },
      { value: "christchurch", label: "Christchurch", desc: "South Island's largest city", icon: "⛰️" },
      { value: "other", label: "Somewhere else", desc: "We'll cover the national essentials", icon: "📍" },
    ],
  },
  {
    id: "family",
    question: "Who are you settling in with?",
    subtitle: "This affects task order and what documents you'll need.",
    options: [
      { value: "alone", label: "Arriving alone", desc: "Solo settlement plan", icon: "🧑" },
      {
        value: "couple_independent",
        label: "Couple — both with work visas",
        desc: "You each have independent visas",
        icon: "👥",
      },
      {
        value: "couple_dependent",
        label: "Couple — one on a partner visa",
        desc: "One primary visa holder, one dependent",
        icon: "👫",
      },
      {
        value: "family",
        label: "Family with children",
        desc: "Includes school enrolment and childcare tasks",
        icon: "👨‍👩‍👧",
      },
    ],
  },
  {
    id: "occupation",
    question: "What's your professional background?",
    subtitle: "We'll tailor job-related guidance to your field.",
    options: [
      { value: "tech", label: "Technology / Engineering", desc: "", icon: "💻" },
      { value: "healthcare", label: "Healthcare", desc: "", icon: "🏥" },
      { value: "education", label: "Education", desc: "", icon: "📚" },
      { value: "finance", label: "Finance / Accounting", desc: "", icon: "📊" },
      { value: "trades", label: "Trades", desc: "", icon: "🔧" },
      { value: "other_pro", label: "Other professional", desc: "", icon: "👔" },
      { value: "looking", label: "Still looking for work", desc: "", icon: "🔍" },
    ],
  },
  {
    id: "arrival",
    question: "When are you arriving — or when did you arrive?",
    subtitle: "This sets your timeline and deadline urgency.",
    options: [
      { value: "not_yet", label: "I haven't arrived yet", desc: "We'll start with pre-arrival tasks", icon: "✈️" },
      { value: "2_weeks", label: "I arrived in the last 2 weeks", desc: "Right on time — let's catch up", icon: "📅" },
      { value: "2_8_weeks", label: "I arrived 2–8 weeks ago", desc: "Some deadlines may be close", icon: "⏰" },
      { value: "2_months_plus", label: "More than 2 months ago", desc: "We'll check what's still needed", icon: "📆" },
    ],
  },
];

const revealMessages = [
  "Checking settlement requirements for your visa...",
  "Sequencing tasks for Auckland...",
  "Adjusting for your situation...",
  "Building your personalised plan...",
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
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeOutUp {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(-20px); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }

  @keyframes pulseGlow {
    0%, 100% { opacity: 0.4; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.1); }
  }

  @keyframes revealTextIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes checkDraw {
    from { stroke-dashoffset: 24; }
    to { stroke-dashoffset: 0; }
  }

  .option-card {
    transition: all 0.2s ease;
    cursor: pointer;
    outline: none;
  }

  .option-card:hover {
    border-color: ${COLORS.borderHover} !important;
    background: ${COLORS.primarySubtle} !important;
    transform: translateY(-1px);
  }

  .option-card:focus-visible {
    border-color: ${COLORS.borderFocus} !important;
    box-shadow: 0 0 0 3px rgba(27, 107, 109, 0.15);
  }

  .option-card.selected {
    border-color: ${COLORS.primary} !important;
    background: ${COLORS.primaryLight} !important;
    transform: translateY(0);
  }

  .option-card.selected:hover {
    background: ${COLORS.primaryLight} !important;
  }

  .progress-segment {
    transition: all 0.4s ease-out;
  }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 3px; }
`;

// ─── Progress Bar ───
function ProgressBar({ current, total }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "rgba(248, 246, 243, 0.95)",
        backdropFilter: "blur(12px)",
        padding: "16px 24px 12px",
        borderBottom: `1px solid ${COLORS.border}`,
      }}
    >
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {/* Logo + step counter */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                background: COLORS.secondary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke={COLORS.textPrimary}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "1.1rem",
                color: COLORS.textPrimary,
              }}
            >
              LandedNZ
            </span>
          </div>
          <span
            style={{
              fontSize: "0.8125rem",
              fontWeight: 500,
              color: COLORS.textTertiary,
            }}
          >
            {current + 1} of {total}
          </span>
        </div>

        {/* Segmented bar */}
        <div style={{ display: "flex", gap: 4 }}>
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className="progress-segment"
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: i <= current ? COLORS.primary : COLORS.border,
                opacity: i < current ? 0.5 : i === current ? 1 : 1,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Scope Declaration (before Q1) ───
function ScopeScreen({ onStart }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        animation: "fadeInUp 0.6s ease-out",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        {/* Icon */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: COLORS.primaryLight,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 28px",
            border: `1px solid ${COLORS.primarySubtle}`,
          }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
              stroke={COLORS.primary}
              strokeWidth="1.5"
            />
            <rect x="9" y="3" width="6" height="4" rx="1" stroke={COLORS.primary} strokeWidth="1.5" />
            <path
              d="M9 12l2 2 4-4"
              stroke={COLORS.primary}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "1.875rem",
            fontWeight: 400,
            color: COLORS.textPrimary,
            marginBottom: 12,
            lineHeight: 1.3,
          }}
        >
          5 quick questions to build
          <br />
          your settlement plan
        </h1>

        <p
          style={{
            fontSize: "1rem",
            lineHeight: 1.6,
            color: COLORS.textSecondary,
            marginBottom: 40,
          }}
        >
          Takes about 2 minutes. No account needed.
        </p>

        <button
          onClick={onStart}
          style={{
            background: COLORS.primary,
            color: COLORS.textInverse,
            border: "none",
            padding: "16px 48px",
            borderRadius: 10,
            fontSize: "1.0625rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
            letterSpacing: "0.01em",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = COLORS.primaryHover;
            e.target.style.transform = "translateY(-1px)";
            e.target.style.boxShadow = "0 8px 24px rgba(27, 107, 109, 0.25)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = COLORS.primary;
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "none";
          }}
        >
          Let's go →
        </button>
      </div>
    </div>
  );
}

// ─── Single Question View ───
function QuestionView({ question, selectedValue, onSelect, animState }) {
  const isCompact = question.options.length > 5;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px 40px",
        animation:
          animState === "entering"
            ? "fadeInUp 0.5s ease-out forwards"
            : animState === "exiting"
              ? "fadeOutUp 0.35s ease-in forwards"
              : "none",
      }}
    >
      <div style={{ maxWidth: 560, width: "100%" }}>
        {/* Question */}
        <h2
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "1.625rem",
            fontWeight: 400,
            color: COLORS.textPrimary,
            marginBottom: 8,
            lineHeight: 1.35,
          }}
        >
          {question.question}
        </h2>
        <p
          style={{
            fontSize: "0.9375rem",
            lineHeight: 1.6,
            color: COLORS.textTertiary,
            marginBottom: 32,
          }}
        >
          {question.subtitle}
        </p>

        {/* Options */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: isCompact ? 8 : 10,
          }}
        >
          {question.options.map((opt, i) => {
            const isSelected = selectedValue === opt.value;
            return (
              <div
                key={opt.value}
                className={`option-card ${isSelected ? "selected" : ""}`}
                tabIndex={0}
                role="button"
                onClick={() => onSelect(opt.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(opt.value);
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: isCompact ? "14px 18px" : "16px 20px",
                  borderRadius: 10,
                  border: `1.5px solid ${isSelected ? COLORS.primary : COLORS.border}`,
                  background: isSelected ? COLORS.primaryLight : COLORS.bgCard,
                  animation: `fadeInUp 0.4s ease-out ${0.05 * i}s both`,
                }}
              >
                {/* Icon */}
                <span
                  style={{
                    fontSize: isCompact ? "1.25rem" : "1.4rem",
                    width: isCompact ? 32 : 40,
                    height: isCompact ? 32 : 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 8,
                    background: isSelected ? "rgba(27, 107, 109, 0.1)" : COLORS.bg,
                    flexShrink: 0,
                    transition: "background 0.2s ease",
                  }}
                >
                  {opt.icon}
                </span>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "0.9375rem",
                      fontWeight: isSelected ? 600 : 500,
                      color: COLORS.textPrimary,
                      lineHeight: 1.4,
                    }}
                  >
                    {opt.label}
                  </div>
                  {opt.desc && (
                    <div
                      style={{
                        fontSize: "0.8125rem",
                        color: COLORS.textTertiary,
                        lineHeight: 1.4,
                        marginTop: 2,
                      }}
                    >
                      {opt.desc}
                    </div>
                  )}
                </div>

                {/* Check */}
                {isSelected && (
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: COLORS.primary,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      animation: "scaleIn 0.2s ease-out",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20 6L9 17l-5-5"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Roadmap Reveal Transition ───
function RoadmapReveal({ answers }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [showFinal, setShowFinal] = useState(false);

  // Customise messages based on answers
  const visaLabel =
    answers.visa === "aewv"
      ? "Accredited Employer Work Visa"
      : answers.visa === "partner_student"
        ? "Partner visa"
        : answers.visa === "green_list"
          ? "Green List Work Visa"
          : answers.visa === "green_residence"
            ? "Green List Residence"
            : "your visa type";

  const cityLabel =
    answers.city === "auckland"
      ? "Auckland"
      : answers.city === "wellington"
        ? "Wellington"
        : answers.city === "christchurch"
          ? "Christchurch"
          : "your city";

  const familyLabel =
    answers.family === "alone"
      ? "Solo plan"
      : answers.family === "couple_independent"
        ? "Dual visa couple adjustments"
        : answers.family === "couple_dependent"
          ? "Partner visa couple adjustments"
          : "Family plan adjustments";

  const messages = [
    `Checking requirements for ${visaLabel}...`,
    `Sequencing tasks for ${cityLabel}...`,
    `${familyLabel} applied...`,
    "Building your personalised plan...",
  ];

  useEffect(() => {
    const timers = [];
    messages.forEach((_, i) => {
      if (i > 0) {
        timers.push(
          setTimeout(() => setMessageIndex(i), i * 600)
        );
      }
    });
    timers.push(
      setTimeout(() => setShowFinal(true), messages.length * 600 + 400)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        animation: "fadeIn 0.4s ease-out",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        {!showFinal ? (
          <>
            {/* Pulsing dots */}
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "center",
                marginBottom: 32,
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: COLORS.primary,
                    animation: `pulseGlow 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>

            {/* Messages */}
            <div style={{ minHeight: 80 }}>
              {messages.slice(0, messageIndex + 1).map((msg, i) => (
                <p
                  key={i}
                  style={{
                    fontSize: "0.9375rem",
                    color: i === messageIndex ? COLORS.textSecondary : COLORS.textTertiary,
                    marginBottom: 8,
                    animation: "revealTextIn 0.35s ease-out",
                    transition: "color 0.3s ease",
                  }}
                >
                  {msg}
                </p>
              ))}
            </div>
          </>
        ) : (
          <div style={{ animation: "scaleIn 0.5s ease-out" }}>
            {/* Success */}
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: COLORS.successLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                border: `2px solid ${COLORS.success}`,
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 6L9 17l-5-5"
                  stroke={COLORS.success}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="24"
                  style={{ animation: "checkDraw 0.5s ease-out 0.1s both" }}
                />
              </svg>
            </div>

            <h2
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "1.625rem",
                fontWeight: 400,
                color: COLORS.textPrimary,
                marginBottom: 8,
              }}
            >
              Your plan is ready
            </h2>
            <p
              style={{
                fontSize: "0.9375rem",
                color: COLORS.textSecondary,
                marginBottom: 32,
              }}
            >
              {answers.city === "auckland" ? "Auckland" : answers.city === "wellington" ? "Wellington" : "Your city"} ·{" "}
              {visaLabel} ·{" "}
              {answers.family === "alone" ? "Solo" : "Couple/Family"}
            </p>

            <button
              style={{
                background: COLORS.primary,
                color: COLORS.textInverse,
                border: "none",
                padding: "16px 48px",
                borderRadius: 10,
                fontSize: "1.0625rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = COLORS.primaryHover;
                e.target.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = COLORS.primary;
                e.target.style.transform = "translateY(0)";
              }}
            >
              See my roadmap →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Onboarding Flow ───
export default function OnboardingFlow() {
  const [phase, setPhase] = useState("scope"); // scope | questions | reveal
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [animState, setAnimState] = useState("entering"); // entering | stable | exiting
  const transitionTimeout = useRef(null);

  const handleStart = () => {
    setPhase("questions");
    setCurrentQ(0);
    setAnimState("entering");
  };

  const handleSelect = (value) => {
    const qId = questions[currentQ].id;
    setAnswers((prev) => ({ ...prev, [qId]: value }));

    // Auto-advance after brief pause
    transitionTimeout.current = setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setAnimState("exiting");
        setTimeout(() => {
          setCurrentQ((prev) => prev + 1);
          setAnimState("entering");
        }, 350);
      } else {
        // Last question — go to reveal
        setAnimState("exiting");
        setTimeout(() => {
          setPhase("reveal");
        }, 350);
      }
    }, 400);
  };

  useEffect(() => {
    return () => {
      if (transitionTimeout.current) clearTimeout(transitionTimeout.current);
    };
  }, []);

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh" }}>
      <style>{styleSheet}</style>

      {phase === "scope" && <ScopeScreen onStart={handleStart} />}

      {phase === "questions" && (
        <>
          <ProgressBar current={currentQ} total={questions.length} />
          <QuestionView
            key={currentQ}
            question={questions[currentQ]}
            selectedValue={answers[questions[currentQ].id]}
            onSelect={handleSelect}
            animState={animState}
          />
        </>
      )}

      {phase === "reveal" && <RoadmapReveal answers={answers} />}
    </div>
  );
}

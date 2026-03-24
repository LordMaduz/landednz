import { useState, useEffect, useRef } from "react";

// LandedNZ Landing Page — Screen 1
// Design ref: 14-ui-ux-design.md, 13-ui-ux-research.md, 16-web-layout-analysis.md
// Tone: Warm authority. Knowledgeable friend who's done this before.
// Palette: Deep teal primary, warm amber secondary, warm off-white base

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
  border: "#E5E3E0",
  borderHover: "#D0CEC8",
};

// ─── Shared Styles ───
const sectionPadding = { padding: "80px 24px" };
const maxWidth = { maxWidth: "1120px", margin: "0 auto" };
const heading1 = {
  fontSize: "2.25rem",
  fontWeight: 700,
  lineHeight: 1.4,
  letterSpacing: "-0.02em",
};
const heading2 = {
  fontSize: "1.75rem",
  fontWeight: 600,
  lineHeight: 1.4,
  letterSpacing: "-0.01em",
};
const heading3 = {
  fontSize: "1.125rem",
  fontWeight: 600,
  lineHeight: 1.4,
};
const bodyText = {
  fontSize: "1rem",
  fontWeight: 400,
  lineHeight: 1.6,
};
const secondaryText = {
  fontSize: "0.875rem",
  fontWeight: 400,
  lineHeight: 1.6,
};
const captionText = {
  fontSize: "0.75rem",
  fontWeight: 500,
  lineHeight: 1.3,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

// ─── Animations via CSS keyframes injected once ───
const styleSheet = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Serif+Display&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body, html {
    font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes subtlePulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.7; }
  }

  .fade-in-up {
    animation: fadeInUp 0.7s ease-out forwards;
    opacity: 0;
  }

  .fade-in {
    animation: fadeIn 0.5s ease-out forwards;
    opacity: 0;
  }

  .delay-1 { animation-delay: 0.1s; }
  .delay-2 { animation-delay: 0.2s; }
  .delay-3 { animation-delay: 0.3s; }
  .delay-4 { animation-delay: 0.4s; }
  .delay-5 { animation-delay: 0.5s; }
  .delay-6 { animation-delay: 0.6s; }

  .cta-btn {
    transition: all 0.2s ease;
    cursor: pointer;
    border: none;
    outline: none;
  }

  .cta-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(212, 168, 67, 0.3);
  }

  .cta-btn:active {
    transform: translateY(0);
  }

  .cta-secondary {
    transition: all 0.2s ease;
    cursor: pointer;
    border: none;
    outline: none;
    background: transparent;
  }

  .cta-secondary:hover {
    opacity: 1 !important;
  }

  .problem-card {
    transition: all 0.25s ease;
    cursor: default;
  }

  .problem-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 32px rgba(26, 26, 46, 0.1);
  }

  .step-card {
    transition: all 0.2s ease;
  }

  .pricing-card {
    transition: all 0.25s ease;
    cursor: default;
  }

  .pricing-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(26, 26, 46, 0.08);
  }

  .nav-link {
    transition: color 0.15s ease;
    cursor: pointer;
  }

  .nav-link:hover {
    color: ${COLORS.secondary} !important;
  }

  /* Subtle grain texture overlay for hero */
  .hero-grain::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 1;
  }

  /* Scrollbar styling */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 3px; }
`;

// ─── Nav ───
function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "0 24px",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: scrolled ? "rgba(27, 107, 109, 0.97)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        transition: "all 0.3s ease",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Logo mark */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: COLORS.secondary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              stroke={COLORS.textPrimary}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "1.25rem",
            color: COLORS.textInverse,
            fontWeight: 400,
          }}
        >
          LandedNZ
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <span className="nav-link" style={{ ...secondaryText, color: "rgba(255,255,255,0.75)" }}>
          How it works
        </span>
        <span className="nav-link" style={{ ...secondaryText, color: "rgba(255,255,255,0.75)" }}>
          Pricing
        </span>
        <button
          className="cta-btn"
          style={{
            background: COLORS.secondary,
            color: COLORS.textPrimary,
            padding: "10px 24px",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: "0.875rem",
          }}
        >
          Build my plan
        </button>
      </div>
    </nav>
  );
}

// ─── Hero Section ───
function Hero() {
  return (
    <section
      className="hero-grain"
      style={{
        position: "relative",
        background: `linear-gradient(160deg, ${COLORS.primary} 0%, #145254 40%, #0F3E40 100%)`,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "120px 24px 80px",
        overflow: "hidden",
      }}
    >
      {/* Decorative circles */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          right: "-5%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          border: "1px solid rgba(212, 168, 67, 0.08)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          left: "-8%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.04)",
          pointerEvents: "none",
        }}
      />

      <div style={{ ...maxWidth, position: "relative", zIndex: 2, textAlign: "center", maxWidth: 800 }}>
        {/* Eyebrow */}
        <div className="fade-in-up delay-1" style={{ marginBottom: 24 }}>
          <span
            style={{
              ...captionText,
              color: COLORS.secondary,
              background: "rgba(212, 168, 67, 0.12)",
              padding: "6px 16px",
              borderRadius: 100,
              display: "inline-block",
            }}
          >
            For skilled migrants arriving in New Zealand
          </span>
        </div>

        {/* Headline */}
        <h1
          className="fade-in-up delay-2"
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "clamp(2rem, 5vw, 3.25rem)",
            fontWeight: 400,
            lineHeight: 1.2,
            color: COLORS.textInverse,
            marginBottom: 20,
            letterSpacing: "-0.01em",
          }}
        >
          You've just arrived in{" "}
          <span style={{ color: COLORS.secondary }}>New Zealand.</span>
          <br />
          We'll tell you what to do first.
        </h1>

        {/* Sub */}
        <p
          className="fade-in-up delay-3"
          style={{
            ...bodyText,
            color: "rgba(255,255,255,0.78)",
            maxWidth: 560,
            margin: "0 auto 40px",
            fontSize: "1.125rem",
          }}
        >
          LandedNZ builds a personalised settlement plan based on your visa, your city, and your
          family. In 2 minutes.
        </p>

        {/* CTA */}
        <div className="fade-in-up delay-4" style={{ marginBottom: 20 }}>
          <button
            className="cta-btn"
            style={{
              background: COLORS.secondary,
              color: COLORS.textPrimary,
              padding: "16px 48px",
              borderRadius: 10,
              fontSize: "1.0625rem",
              fontWeight: 600,
              letterSpacing: "0.01em",
            }}
          >
            Build my plan — free
          </button>
        </div>

        {/* Secondary link */}
        <div className="fade-in-up delay-5">
          <button
            className="cta-secondary"
            style={{
              ...secondaryText,
              color: "rgba(255,255,255,0.55)",
              textDecoration: "underline",
              textUnderlineOffset: 4,
            }}
          >
            See how it works ↓
          </button>
        </div>

        {/* Trust signal */}
        <p
          className="fade-in delay-6"
          style={{
            ...captionText,
            color: "rgba(255,255,255,0.4)",
            marginTop: 48,
            textTransform: "none",
            letterSpacing: "0.02em",
            fontWeight: 400,
          }}
        >
          No account needed · No payment required · Your plan in 2 minutes
        </p>
      </div>
    </section>
  );
}

// ─── Problem Statement Section ───
function ProblemStatement() {
  const problems = [
    {
      stat: "45%",
      label: "emergency tax",
      desc: "Miss your IRD number in week one and every paycheck loses $300–400.",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke={COLORS.error} strokeWidth="1.5" />
          <path d="M12 8v4M12 16h.01" stroke={COLORS.error} strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      stat: "$3,000",
      label: "wrong suburb",
      desc: "Sign a lease before understanding school zones and you're moving again.",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            stroke={COLORS.error}
            strokeWidth="1.5"
          />
          <path d="M9 22V12h6v10" stroke={COLORS.error} strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      stat: "$600/yr",
      label: "in fees",
      desc: "Send money home through a bank instead of Wise and it costs $300–600 extra per year.",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"
            stroke={COLORS.error}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ];

  return (
    <section style={{ ...sectionPadding, background: COLORS.bg }}>
      <div style={{ ...maxWidth }}>
        <p
          style={{
            ...captionText,
            color: COLORS.primary,
            textAlign: "center",
            marginBottom: 12,
          }}
        >
          The cost of not knowing
        </p>
        <h2
          style={{
            ...heading2,
            color: COLORS.textPrimary,
            textAlign: "center",
            marginBottom: 48,
            fontFamily: "'DM Serif Display', serif",
            fontWeight: 400,
            fontSize: "1.875rem",
          }}
        >
          These mistakes happen every week
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
            marginBottom: 48,
          }}
        >
          {problems.map((p, i) => (
            <div
              key={i}
              className="problem-card"
              style={{
                background: COLORS.bgCard,
                borderRadius: 12,
                padding: 28,
                border: `1px solid ${COLORS.border}`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Top accent line */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: `linear-gradient(90deg, ${COLORS.error}, ${COLORS.warning})`,
                  opacity: 0.7,
                }}
              />
              <div style={{ marginBottom: 16 }}>{p.icon}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
                <span
                  style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: "2rem",
                    color: COLORS.textPrimary,
                    fontWeight: 400,
                  }}
                >
                  {p.stat}
                </span>
                <span style={{ ...secondaryText, color: COLORS.textSecondary }}>{p.label}</span>
              </div>
              <p style={{ ...bodyText, color: COLORS.textSecondary, fontSize: "0.9375rem" }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>

        <p
          style={{
            ...bodyText,
            color: COLORS.textPrimary,
            textAlign: "center",
            maxWidth: 600,
            margin: "0 auto",
            fontSize: "1.0625rem",
            fontWeight: 500,
          }}
        >
          These mistakes happen because nobody tells you the order.{" "}
          <span style={{ color: COLORS.primary, fontWeight: 600 }}>LandedNZ tells you the order.</span>
        </p>
      </div>
    </section>
  );
}

// ─── How It Works Section ───
function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Answer 5 questions",
      desc: "Your visa, city, family, job, arrival date.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="3" width="16" height="18" rx="2" stroke={COLORS.primary} strokeWidth="1.5" />
          <path d="M8 7h8M8 11h8M8 15h4" stroke={COLORS.primary} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      num: "02",
      title: "Get your personalised plan",
      desc: "A sequenced roadmap built for your exact situation.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
            stroke={COLORS.primary}
            strokeWidth="1.5"
          />
          <rect x="9" y="3" width="6" height="4" rx="1" stroke={COLORS.primary} strokeWidth="1.5" />
          <path d="M9 12l2 2 4-4" stroke={COLORS.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      num: "03",
      title: "Complete tasks with confidence",
      desc: "Step-by-step guides with official source links.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke={COLORS.primary} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M22 4L12 14.01l-3-3" stroke={COLORS.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];

  return (
    <section style={{ ...sectionPadding, background: COLORS.bgCard }}>
      <div style={{ ...maxWidth }}>
        <p
          style={{
            ...captionText,
            color: COLORS.primary,
            textAlign: "center",
            marginBottom: 12,
          }}
        >
          How it works
        </p>
        <h2
          style={{
            ...heading2,
            color: COLORS.textPrimary,
            textAlign: "center",
            marginBottom: 56,
            fontFamily: "'DM Serif Display', serif",
            fontWeight: 400,
            fontSize: "1.875rem",
          }}
        >
          From questions to action in 2 minutes
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 32,
          }}
        >
          {steps.map((s, i) => (
            <div
              key={i}
              className="step-card"
              style={{
                textAlign: "center",
                padding: "0 8px",
              }}
            >
              {/* Icon circle */}
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: COLORS.primarySubtle,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  border: `1px solid ${COLORS.primaryLight}`,
                }}
              >
                {s.icon}
              </div>
              {/* Step number */}
              <span
                style={{
                  ...captionText,
                  color: COLORS.textTertiary,
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Step {s.num}
              </span>
              <h3
                style={{
                  ...heading3,
                  color: COLORS.textPrimary,
                  marginBottom: 8,
                }}
              >
                {s.title}
              </h3>
              <p style={{ ...bodyText, color: COLORS.textSecondary, fontSize: "0.9375rem" }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Social Proof Section ───
function SocialProof() {
  return (
    <section style={{ ...sectionPadding, background: COLORS.bg, paddingTop: 64, paddingBottom: 64 }}>
      <div
        style={{
          ...maxWidth,
          maxWidth: 720,
          textAlign: "center",
        }}
      >
        <div
          style={{
            background: COLORS.bgCard,
            borderRadius: 12,
            padding: "36px 40px",
            border: `1px solid ${COLORS.border}`,
            position: "relative",
          }}
        >
          {/* Quote mark */}
          <div
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "4rem",
              color: COLORS.primaryLight,
              lineHeight: 1,
              marginBottom: -16,
              userSelect: "none",
            }}
          >
            "
          </div>
          <p
            style={{
              ...bodyText,
              color: COLORS.textPrimary,
              fontSize: "1.0625rem",
              fontStyle: "italic",
              marginBottom: 20,
              lineHeight: 1.7,
            }}
          >
            Built by a migrant, for migrants. Every feature is built from lived experience — settling
            in Auckland in 2026, navigating the same bureaucracy, making the same mistakes so you
            don't have to.
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: COLORS.primaryLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: COLORS.primary,
                fontWeight: 600,
                fontSize: "0.875rem",
              }}
            >
              R
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ ...secondaryText, color: COLORS.textPrimary, fontWeight: 600 }}>
                Ruchira
              </div>
              <div style={{ ...captionText, color: COLORS.textTertiary, textTransform: "none" }}>
                Founder, LandedNZ
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Pricing Preview Section ───
function Pricing() {
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <section style={{ ...sectionPadding, background: COLORS.bgCard }}>
      <div style={{ ...maxWidth, maxWidth: 880 }}>
        <p
          style={{
            ...captionText,
            color: COLORS.primary,
            textAlign: "center",
            marginBottom: 12,
          }}
        >
          Simple pricing
        </p>
        <h2
          style={{
            ...heading2,
            color: COLORS.textPrimary,
            textAlign: "center",
            marginBottom: 48,
            fontFamily: "'DM Serif Display', serif",
            fontWeight: 400,
            fontSize: "1.875rem",
          }}
        >
          Start free. Upgrade when you're ready.
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: 20,
            marginBottom: 36,
          }}
        >
          {/* Free */}
          <div
            className="pricing-card"
            onMouseEnter={() => setHoveredCard("free")}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              background: COLORS.bg,
              borderRadius: 12,
              padding: 32,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <span
              style={{
                ...captionText,
                color: COLORS.textTertiary,
                display: "block",
                marginBottom: 8,
              }}
            >
              Free plan
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
              <span
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: "2.5rem",
                  color: COLORS.textPrimary,
                }}
              >
                $0
              </span>
            </div>
            <p
              style={{
                ...secondaryText,
                color: COLORS.textSecondary,
                marginBottom: 24,
              }}
            >
              Your first 2 weeks covered
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {["Personalised roadmap", "Progress tracking", "Government source links"].map(
                (item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20 6L9 17l-5-5"
                        stroke={COLORS.success}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span style={{ ...bodyText, color: COLORS.textPrimary, fontSize: "0.9375rem" }}>
                      {item}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Premium */}
          <div
            className="pricing-card"
            onMouseEnter={() => setHoveredCard("premium")}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              background: COLORS.bgCard,
              borderRadius: 12,
              padding: 32,
              border: `2px solid ${COLORS.primary}`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Recommended badge */}
            <div
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: COLORS.primary,
                color: COLORS.textInverse,
                ...captionText,
                padding: "4px 12px",
                borderRadius: 100,
                textTransform: "none",
                letterSpacing: "0.02em",
              }}
            >
              Recommended
            </div>
            <span
              style={{
                ...captionText,
                color: COLORS.primary,
                display: "block",
                marginBottom: 8,
              }}
            >
              Premium
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
              <span
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: "2.5rem",
                  color: COLORS.textPrimary,
                }}
              >
                $49
              </span>
              <span style={{ ...secondaryText, color: COLORS.textTertiary }}>/6 months</span>
            </div>
            <p
              style={{
                ...secondaryText,
                color: COLORS.textSecondary,
                marginBottom: 24,
              }}
            >
              Full 8-week settlement roadmap
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "Everything in Free",
                "Complete Phase 3 roadmap",
                "AI settlement advisor",
                "Smart deadline reminders",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 6L9 17l-5-5"
                      stroke={COLORS.primary}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span style={{ ...bodyText, color: COLORS.textPrimary, fontSize: "0.9375rem" }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Anchor copy */}
        <div
          style={{
            background: COLORS.warningLight,
            borderRadius: 10,
            padding: "16px 24px",
            textAlign: "center",
            border: `1px solid rgba(212, 168, 67, 0.2)`,
          }}
        >
          <p style={{ ...bodyText, color: COLORS.textPrimary, fontWeight: 500 }}>
            One week of emergency tax costs ~$240.{" "}
            <span style={{ color: COLORS.primary, fontWeight: 600 }}>
              Six months of LandedNZ costs $49.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA Section ───
function FinalCTA() {
  return (
    <section
      style={{
        background: `linear-gradient(160deg, ${COLORS.primary} 0%, #145254 100%)`,
        padding: "80px 24px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative */}
      <div
        style={{
          position: "absolute",
          top: "-30%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 600,
          height: 600,
          borderRadius: "50%",
          border: "1px solid rgba(212, 168, 67, 0.06)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 2 }}>
        <h2
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)",
            fontWeight: 400,
            color: COLORS.textInverse,
            marginBottom: 12,
            lineHeight: 1.3,
          }}
        >
          Your settlement plan is 2 minutes away
        </h2>
        <p
          style={{
            ...bodyText,
            color: "rgba(255,255,255,0.7)",
            marginBottom: 32,
          }}
        >
          5 questions. No account required.
        </p>
        <button
          className="cta-btn"
          style={{
            background: COLORS.secondary,
            color: COLORS.textPrimary,
            padding: "16px 48px",
            borderRadius: 10,
            fontSize: "1.0625rem",
            fontWeight: 600,
            letterSpacing: "0.01em",
          }}
        >
          Build my plan — free
        </button>
      </div>
    </section>
  );
}

// ─── Footer ───
function Footer() {
  return (
    <footer
      style={{
        background: "#0F3E40",
        padding: "40px 24px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        style={{
          ...maxWidth,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: COLORS.secondary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
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
              fontSize: "1rem",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            LandedNZ
          </span>
        </div>

        <div style={{ display: "flex", gap: 24 }}>
          <span style={{ ...captionText, color: "rgba(255,255,255,0.35)", textTransform: "none" }}>
            Privacy
          </span>
          <span style={{ ...captionText, color: "rgba(255,255,255,0.35)", textTransform: "none" }}>
            Terms
          </span>
          <span style={{ ...captionText, color: "rgba(255,255,255,0.35)", textTransform: "none" }}>
            Contact
          </span>
        </div>

        <span style={{ ...captionText, color: "rgba(255,255,255,0.25)", textTransform: "none" }}>
          © 2026 LandedNZ
        </span>
      </div>
    </footer>
  );
}

// ─── Main App ───
export default function LandingPage() {
  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh" }}>
      <style>{styleSheet}</style>
      <Nav />
      <Hero />
      <ProblemStatement />
      <HowItWorks />
      <SocialProof />
      <Pricing />
      <FinalCTA />
      <Footer />
    </div>
  );
}

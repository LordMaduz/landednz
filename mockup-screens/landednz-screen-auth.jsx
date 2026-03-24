import { useState } from "react";

// LandedNZ Auth — Screen 9
// Centered card (max-width 420px), full-viewport, no sidebar
// Framing: "Save your progress" not "Create an account"
// Google OAuth primary, magic link email secondary

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
  error: "#C75B4A",
  errorLight: "#FDF0EE",
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
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }

  .google-btn {
    transition: all 0.15s ease;
    cursor: pointer;
    border: 1.5px solid ${COLORS.border};
    outline: none;
  }
  .google-btn:hover {
    border-color: ${COLORS.borderHover};
    background: ${COLORS.primarySubtle} !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(26, 26, 46, 0.06);
  }
  .google-btn:active {
    transform: translateY(0);
  }
  .google-btn:disabled {
    opacity: 0.6;
    cursor: default;
    transform: none !important;
    box-shadow: none !important;
  }

  .email-btn {
    transition: all 0.15s ease;
    cursor: pointer;
    border: none;
    outline: none;
  }
  .email-btn:hover {
    background: ${COLORS.primaryHover} !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(27, 107, 109, 0.25);
  }
  .email-btn:disabled {
    opacity: 0.5;
    cursor: default;
    transform: none !important;
    box-shadow: none !important;
  }

  .email-input {
    transition: all 0.15s ease;
    outline: none;
    border: 1.5px solid ${COLORS.border};
    font-family: inherit;
  }
  .email-input:hover {
    border-color: ${COLORS.borderHover};
  }
  .email-input:focus {
    border-color: ${COLORS.primary};
    box-shadow: 0 0 0 3px rgba(27, 107, 109, 0.1);
  }
  .email-input.error {
    border-color: ${COLORS.error} !important;
    box-shadow: 0 0 0 3px rgba(199, 91, 74, 0.1);
  }

  .back-link {
    transition: all 0.12s ease;
    cursor: pointer;
    border: none;
    background: transparent;
    padding: 0;
  }
  .back-link:hover {
    color: ${COLORS.primaryHover} !important;
  }
`;

// ─── Spinner ───
function Spinner({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2.5" opacity="0.25" />
      <path d="M12 2a10 10 0 019.95 9" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// ─── Google Logo SVG ───
function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

// ─── Auth Card ───
function AuthCard() {
  const [mode, setMode] = useState("main"); // main | email | magic_sent | google_loading | error
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleGoogleClick = () => {
    setMode("google_loading");
    // Simulate — in real app, redirect to Supabase OAuth
    setTimeout(() => setMode("main"), 2500);
  };

  const handleEmailSubmit = () => {
    if (!email.trim()) {
      setEmailError("Please enter your email address.");
      return;
    }
    if (!isValidEmail(email)) {
      setEmailError("That doesn't look like a valid email address.");
      return;
    }
    setEmailError("");
    setMode("magic_sent");
  };

  // ─── Magic Link Sent State ───
  if (mode === "magic_sent") {
    return (
      <div style={{ textAlign: "center", animation: "scaleIn 0.3s ease-out" }}>
        {/* Email icon */}
        <div
          style={{
            width: 64, height: 64, borderRadius: "50%",
            background: COLORS.successLight,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="4" width="20" height="16" rx="2" stroke={COLORS.success} strokeWidth="1.5" />
            <path d="M22 4l-10 8L2 4" stroke={COLORS.success} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h2
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "1.375rem", fontWeight: 400,
            color: COLORS.textPrimary, marginBottom: 8,
          }}
        >
          Check your email
        </h2>
        <p style={{ fontSize: "0.9375rem", lineHeight: 1.6, color: COLORS.textSecondary, marginBottom: 8 }}>
          We sent a sign-in link to
        </p>
        <p style={{ fontSize: "0.9375rem", fontWeight: 600, color: COLORS.textPrimary, marginBottom: 24 }}>
          {email}
        </p>
        <p style={{ fontSize: "0.8125rem", lineHeight: 1.6, color: COLORS.textTertiary, marginBottom: 28 }}>
          Click the link in the email to sign in. It expires in 10 minutes.
          <br />
          Check your spam folder if you don't see it.
        </p>

        <button
          className="back-link"
          onClick={() => { setMode("email"); }}
          style={{ fontSize: "0.8125rem", fontWeight: 500, color: COLORS.primary }}
        >
          ← Use a different email
        </button>
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeInUp 0.5s ease-out" }}>
      {/* Logo */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: COLORS.secondary,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke={COLORS.textPrimary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.25rem", color: COLORS.textPrimary }}>
            LandedNZ
          </span>
        </div>
      </div>

      {/* Heading */}
      <h1
        style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: "1.5rem", fontWeight: 400,
          color: COLORS.textPrimary,
          textAlign: "center", marginBottom: 8,
        }}
      >
        Save your progress
      </h1>
      <p
        style={{
          fontSize: "0.9375rem", lineHeight: 1.6,
          color: COLORS.textSecondary,
          textAlign: "center", marginBottom: 32,
        }}
      >
        Sign in to keep your roadmap and pick up where you left off.
      </p>

      {/* Google OAuth */}
      <button
        className="google-btn"
        onClick={handleGoogleClick}
        disabled={mode === "google_loading"}
        style={{
          width: "100%",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          padding: "14px 20px",
          borderRadius: 10,
          background: COLORS.bgCard,
          fontSize: "0.9375rem", fontWeight: 500,
          color: COLORS.textPrimary,
          marginBottom: 20,
        }}
      >
        {mode === "google_loading" ? (
          <>
            <Spinner size={18} color={COLORS.textTertiary} />
            <span style={{ color: COLORS.textTertiary }}>Connecting to Google...</span>
          </>
        ) : (
          <>
            <GoogleLogo />
            Continue with Google
          </>
        )}
      </button>

      {/* Divider */}
      <div
        style={{
          display: "flex", alignItems: "center", gap: 16,
          marginBottom: 20,
        }}
      >
        <div style={{ flex: 1, height: 1, background: COLORS.border }} />
        <span style={{ fontSize: "0.8125rem", color: COLORS.textTertiary }}>or</span>
        <div style={{ flex: 1, height: 1, background: COLORS.border }} />
      </div>

      {/* Email magic link */}
      {mode === "email" || mode === "error" ? (
        <div style={{ animation: "fadeIn 0.2s ease-out" }}>
          <div style={{ marginBottom: 12 }}>
            <input
              type="email"
              className={`email-input ${emailError ? "error" : ""}`}
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleEmailSubmit(); }}
              placeholder="Enter your email"
              style={{
                width: "100%",
                padding: "13px 16px",
                borderRadius: 10,
                fontSize: "0.9375rem",
                color: COLORS.textPrimary,
                background: COLORS.bgCard,
              }}
            />
            {emailError && (
              <p style={{ fontSize: "0.8125rem", color: COLORS.error, marginTop: 6, animation: "fadeIn 0.15s ease-out" }}>
                {emailError}
              </p>
            )}
          </div>
          <button
            className="email-btn"
            onClick={handleEmailSubmit}
            style={{
              width: "100%",
              padding: "14px 20px",
              borderRadius: 10,
              background: COLORS.primary,
              color: COLORS.textInverse,
              fontSize: "0.9375rem", fontWeight: 600,
            }}
          >
            Continue
          </button>
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <button
              className="back-link"
              onClick={() => { setMode("main"); setEmailError(""); }}
              style={{ fontSize: "0.8125rem", color: COLORS.textTertiary }}
            >
              ← Back
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setMode("email")}
          style={{
            width: "100%",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "14px 20px",
            borderRadius: 10,
            border: `1.5px solid ${COLORS.border}`,
            background: "transparent",
            fontSize: "0.9375rem", fontWeight: 500,
            color: COLORS.textSecondary,
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.borderHover; e.currentTarget.style.background = COLORS.primarySubtle; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.background = "transparent"; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M22 4l-10 8L2 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Continue with email
        </button>
      )}

      {/* Trust signal */}
      <p
        style={{
          fontSize: "0.8125rem", color: COLORS.textTertiary,
          textAlign: "center", marginTop: 20, lineHeight: 1.5,
        }}
      >
        We'll never share your email. No spam, ever.
      </p>

      {/* Terms */}
      <p
        style={{
          fontSize: "0.6875rem", color: COLORS.textTertiary,
          textAlign: "center", marginTop: 16, lineHeight: 1.5,
        }}
      >
        By continuing, you agree to our{" "}
        <span style={{ color: COLORS.primary, cursor: "pointer" }}>Terms of Service</span>
        {" "}and{" "}
        <span style={{ color: COLORS.primary, cursor: "pointer" }}>Privacy Policy</span>
      </p>
    </div>
  );
}

// ─── Main Screen ───
export default function AuthScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        position: "relative",
      }}
    >
      <style>{styleSheet}</style>

      {/* Subtle decorative circles */}
      <div
        style={{
          position: "absolute",
          top: "10%", right: "10%",
          width: 300, height: 300,
          borderRadius: "50%",
          border: `1px solid ${COLORS.border}`,
          opacity: 0.3,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "15%", left: "8%",
          width: 200, height: 200,
          borderRadius: "50%",
          border: `1px solid ${COLORS.border}`,
          opacity: 0.2,
          pointerEvents: "none",
        }}
      />

      {/* Auth card */}
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: COLORS.bgCard,
          borderRadius: 16,
          border: `1px solid ${COLORS.border}`,
          padding: "40px 36px",
          boxShadow: "0 4px 24px rgba(26, 26, 46, 0.06)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <AuthCard />
      </div>
    </div>
  );
}

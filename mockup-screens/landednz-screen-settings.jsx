import { useState } from "react";

// LandedNZ Settings — Screen 7
// Single column, max-width 720px, centered. Sidebar visible. No right panel.
// Sections: Profile, Subscription, Notifications, Account

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
  border: "#E5E3E0",
  borderHover: "#D0CEC8",
  premiumGold: "#D4A843",
};

const styleSheet = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Serif+Display&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }
  body, html {
    font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    -webkit-font-smoothing: antialiased;
    background: ${COLORS.bg};
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

  .edit-link {
    transition: all 0.12s ease;
    cursor: pointer;
    border: none;
    background: transparent;
    padding: 0;
  }
  .edit-link:hover {
    color: ${COLORS.primaryHover} !important;
    text-decoration: underline;
  }

  .toggle-track {
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .action-btn {
    transition: all 0.15s ease;
    cursor: pointer;
    border: none;
  }
  .action-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(27, 107, 109, 0.2);
  }

  .outline-btn {
    transition: all 0.15s ease;
    cursor: pointer;
  }
  .outline-btn:hover {
    background: ${COLORS.primarySubtle} !important;
    border-color: ${COLORS.primary} !important;
  }

  .danger-link {
    transition: all 0.12s ease;
    cursor: pointer;
    border: none;
    background: transparent;
    padding: 0;
  }
  .danger-link:hover {
    color: ${COLORS.error} !important;
    text-decoration: underline;
  }

  .radio-option {
    transition: all 0.12s ease;
    cursor: pointer;
  }
  .radio-option:hover {
    border-color: ${COLORS.borderHover} !important;
    background: ${COLORS.primarySubtle} !important;
  }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 3px; }
`;

// ─── Toggle Switch ───
function Toggle({ checked, onChange }) {
  return (
    <div
      className="toggle-track"
      onClick={() => onChange(!checked)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        background: checked ? COLORS.primary : COLORS.border,
        padding: 2,
        display: "flex",
        alignItems: "center",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: COLORS.bgCard,
          boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
          transform: checked ? "translateX(20px)" : "translateX(0)",
          transition: "transform 0.2s ease",
        }}
      />
    </div>
  );
}

// ─── Field Row ───
function FieldRow({ label, value, editable = false, onEdit, muted = false, badge = null }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 0",
        borderBottom: `1px solid ${COLORS.border}`,
        gap: 16,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "0.8125rem", color: COLORS.textTertiary, marginBottom: 3, fontWeight: 500 }}>
          {label}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: "0.9375rem", color: muted ? COLORS.textTertiary : COLORS.textPrimary, fontWeight: 400 }}>
            {value}
          </div>
          {badge && (
            <span style={{ fontSize: "0.6875rem", fontWeight: 500, padding: "2px 8px", borderRadius: 100, background: badge.bg, color: badge.color }}>
              {badge.text}
            </span>
          )}
        </div>
      </div>
      {editable && (
        <button className="edit-link" onClick={onEdit} style={{ fontSize: "0.8125rem", fontWeight: 500, color: COLORS.primary }}>
          Edit
        </button>
      )}
    </div>
  );
}

// ─── Section Card ───
function SectionCard({ title, children, icon }) {
  return (
    <div
      style={{
        background: COLORS.bgCard,
        borderRadius: 12,
        border: `1px solid ${COLORS.border}`,
        padding: "24px 28px",
        marginBottom: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: "1.1rem" }}>{icon}</span>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, color: COLORS.textPrimary }}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

// ─── Delete Confirmation Modal ───
function DeleteModal({ onCancel, onConfirm }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(26, 26, 46, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        animation: "fadeIn 0.15s ease-out",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          background: COLORS.bgCard,
          borderRadius: 14,
          padding: "28px 32px",
          maxWidth: 420,
          width: "90%",
          border: `1px solid ${COLORS.border}`,
          boxShadow: "0 16px 48px rgba(26, 26, 46, 0.15)",
          animation: "scaleIn 0.2s ease-out",
        }}
      >
        {/* Warning icon */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: COLORS.errorLight,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke={COLORS.error} strokeWidth="1.5" />
            <path d="M12 8v4M12 16h.01" stroke={COLORS.error} strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: COLORS.textPrimary, marginBottom: 8 }}>
          Delete your account?
        </h3>
        <p style={{ fontSize: "0.9375rem", lineHeight: 1.6, color: COLORS.textSecondary, marginBottom: 24 }}>
          This will permanently delete your roadmap, progress, and subscription. This cannot be undone.
        </p>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            className="outline-btn"
            style={{
              flex: 1,
              padding: "12px 20px",
              borderRadius: 8,
              border: `1.5px solid ${COLORS.border}`,
              background: "transparent",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: COLORS.textSecondary,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "12px 20px",
              borderRadius: 8,
              border: "none",
              background: COLORS.error,
              color: COLORS.textInverse,
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => { e.target.style.opacity = "0.9"; }}
            onMouseLeave={(e) => { e.target.style.opacity = "1"; }}
          >
            Delete my account
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Settings Screen ───
export default function SettingsScreen() {
  const [emailReminders, setEmailReminders] = useState(true);
  const [reminderFreq, setReminderFreq] = useState("deadlines");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: COLORS.bg }}>
      <style>{styleSheet}</style>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>

      {/* Sidebar */}
      <div style={{ width: 256, background: COLORS.bgSidebar, borderRight: `1px solid ${COLORS.border}`, flexShrink: 0, overflowY: "auto", position: "sticky", top: 0, height: "100vh", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 20px 20px" }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: COLORS.secondary, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke={COLORS.textPrimary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.125rem", color: COLORS.textPrimary }}>LandedNZ</span>
        </div>

        <div style={{ padding: "0 12px" }}>
          {[
            { label: "Roadmap", active: false, icon: "◉" },
            { label: "Chat", active: false, icon: "💬" },
            { label: "Settings", active: true, icon: "⚙" },
          ].map((item) => (
            <button key={item.label} className="sidebar-item" style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, fontSize: "0.875rem", fontWeight: item.active ? 600 : 400, color: item.active ? COLORS.primary : COLORS.textSecondary, background: item.active ? COLORS.primaryLight : "transparent", borderLeft: item.active ? `3px solid ${COLORS.primary}` : "3px solid transparent" }}>
              <span style={{ fontSize: "0.9rem", width: 20, textAlign: "center" }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* User footer */}
        <div style={{ borderTop: `1px solid ${COLORS.border}`, padding: "14px 20px", marginTop: "auto" }}>
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
      <div style={{ flex: 1, padding: "32px 40px 60px", overflowY: "auto" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>

          {/* Page heading */}
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.5rem", fontWeight: 400, color: COLORS.textPrimary, marginBottom: 28 }}>
            Settings
          </h1>

          {/* ═══ PROFILE ═══ */}
          <SectionCard title="Profile" icon="👤">
            <FieldRow
              label="Name"
              value="Priya Ramaswamy"
              editable
              onEdit={() => {}}
            />
            <FieldRow
              label="Email"
              value="priya.ramaswamy@gmail.com"
              muted={false}
              badge={{ text: "Managed by Google", bg: COLORS.bg, color: COLORS.textTertiary }}
            />

            <div style={{ paddingTop: 16, marginBottom: 8 }}>
              <div style={{ fontSize: "0.8125rem", color: COLORS.textTertiary, fontWeight: 500, marginBottom: 12 }}>
                Your onboarding answers
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                <FieldRow label="Visa type" value="Partner of Student" editable onEdit={() => {}} />
                <FieldRow label="City" value="Auckland" editable onEdit={() => {}} />
                <FieldRow label="Settling with" value="Couple (partner visa)" editable onEdit={() => {}} />
                <FieldRow label="Occupation" value="Technology / Engineering" editable onEdit={() => {}} />
                <FieldRow label="Arrival" value="Last 2 weeks" editable onEdit={() => {}} />
              </div>
              <p style={{ fontSize: "0.8125rem", color: COLORS.textTertiary, marginTop: 12, fontStyle: "italic" }}>
                Changing your answers will update your roadmap to match.
              </p>
            </div>
          </SectionCard>

          {/* ═══ SUBSCRIPTION ═══ */}
          <SectionCard title="Subscription" icon="⭐">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${COLORS.border}` }}>
              <div>
                <div style={{ fontSize: "0.8125rem", color: COLORS.textTertiary, marginBottom: 3, fontWeight: 500 }}>Current plan</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "0.9375rem", fontWeight: 500, color: COLORS.textPrimary }}>Free</span>
                  <span style={{ fontSize: "0.6875rem", fontWeight: 500, padding: "2px 8px", borderRadius: 100, background: COLORS.bg, color: COLORS.textTertiary }}>
                    Phase 1 & 2 only
                  </span>
                </div>
              </div>
            </div>

            <div style={{ paddingTop: 16 }}>
              <div
                style={{
                  background: `linear-gradient(135deg, ${COLORS.primary} 0%, #145254 100%)`,
                  borderRadius: 10,
                  padding: "18px 22px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                }}
              >
                <div>
                  <p style={{ fontSize: "0.9375rem", fontWeight: 600, color: COLORS.textInverse, marginBottom: 4 }}>
                    Upgrade to Premium
                  </p>
                  <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.7)" }}>
                    Full roadmap, AI advisor, smart reminders — $49 for 6 months
                  </p>
                </div>
                <button
                  className="action-btn"
                  style={{
                    background: COLORS.secondary,
                    color: COLORS.textPrimary,
                    padding: "10px 20px",
                    borderRadius: 8,
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  Upgrade
                </button>
              </div>
            </div>
          </SectionCard>

          {/* ═══ NOTIFICATIONS ═══ */}
          <SectionCard title="Notifications" icon="🔔">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${COLORS.border}` }}>
              <div>
                <div style={{ fontSize: "0.9375rem", fontWeight: 500, color: COLORS.textPrimary }}>Email reminders</div>
                <div style={{ fontSize: "0.8125rem", color: COLORS.textTertiary, marginTop: 2 }}>
                  Receive deadline alerts and progress updates
                </div>
              </div>
              <Toggle checked={emailReminders} onChange={setEmailReminders} />
            </div>

            {emailReminders && (
              <div style={{ padding: "16px 0 4px" }}>
                <div style={{ fontSize: "0.8125rem", color: COLORS.textTertiary, fontWeight: 500, marginBottom: 10 }}>
                  Reminder frequency
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    { id: "deadlines", label: "Before deadlines only", desc: "We'll email when a task deadline is approaching" },
                    { id: "weekly", label: "Weekly progress summary", desc: "A quick recap of what you've done and what's next" },
                  ].map((opt) => (
                    <div
                      key={opt.id}
                      className="radio-option"
                      onClick={() => setReminderFreq(opt.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 14px",
                        borderRadius: 8,
                        border: `1.5px solid ${reminderFreq === opt.id ? COLORS.primary : COLORS.border}`,
                        background: reminderFreq === opt.id ? COLORS.primarySubtle : "transparent",
                      }}
                    >
                      {/* Radio */}
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          border: `2px solid ${reminderFreq === opt.id ? COLORS.primary : COLORS.border}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "border-color 0.15s ease",
                        }}
                      >
                        {reminderFreq === opt.id && (
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.primary }} />
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: "0.875rem", fontWeight: 500, color: COLORS.textPrimary }}>{opt.label}</div>
                        <div style={{ fontSize: "0.8125rem", color: COLORS.textTertiary, marginTop: 1 }}>{opt.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: "0.8125rem", color: COLORS.textTertiary, marginTop: 12, fontStyle: "italic" }}>
                  We'll only email about tasks that matter — never spam.
                </p>
              </div>
            )}
          </SectionCard>

          {/* ═══ ACCOUNT ═══ */}
          <SectionCard title="Account" icon="🔐">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button
                className="outline-btn"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "12px 20px",
                  borderRadius: 8,
                  border: `1.5px solid ${COLORS.border}`,
                  background: "transparent",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: COLORS.textSecondary,
                  width: "100%",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Sign out
              </button>

              <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 16, marginTop: 4 }}>
                <button
                  className="danger-link"
                  onClick={() => setShowDeleteModal(true)}
                  style={{
                    fontSize: "0.8125rem",
                    color: COLORS.textTertiary,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Delete account
                </button>
              </div>
            </div>
          </SectionCard>

        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <DeleteModal
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}

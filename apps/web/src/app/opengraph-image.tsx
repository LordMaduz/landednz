import { ImageResponse } from "next/og"

// ImageResponse renders outside the page CSS, so this file uses the token hex values directly (CW01 exemption in cw01.test.ts).
export const alt = "LandedNZ: know what to do next in New Zealand"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 96, background: "#FFFFFF", color: "#0F2A3A" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="6" fill="#0F2A3A" />
            <path d="M4 15.5c2.6-.9 4.2-3.6 8-3.6s5.4 2.7 8 3.6" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M6.5 19c1.9-.6 3-2.2 5.5-2.2s3.6 1.6 5.5 2.2" stroke="#FFFFFF" strokeOpacity=".55" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="16.5" cy="7.5" r="2" fill="#3FC9B7" />
          </svg>
          <span style={{ fontSize: 32, fontWeight: 600 }}>LandedNZ</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <span style={{ fontSize: 72, fontWeight: 600, lineHeight: 1.05, letterSpacing: "-0.03em", maxWidth: 900 }}>Know what to do next in New Zealand</span>
          <span style={{ fontSize: 32, color: "#4B6170" }}>A settling-in roadmap built for your visa, your city and the people moving with you.</span>
        </div>
      </div>
    ),
    size,
  )
}

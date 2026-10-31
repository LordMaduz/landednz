import { ImageResponse } from "next/og"
import { LogoMark } from "@/lib/logo-mark"

// ImageResponse renders outside the page CSS, so this file uses the token hex values directly (CW01 exemption in cw01.test.ts).
export const alt = "LandedNZ: know what to do next in New Zealand"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 96, background: "#FFFFFF", color: "#0F2A3A" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <LogoMark size={48} />
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

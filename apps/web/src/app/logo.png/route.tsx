import { ImageResponse } from "next/og"
import { LogoMark } from "@/lib/logo-mark"

// Square brand logo for Organization structured data and profiles; reads no request data, so it is prerendered at build.
export function GET() {
  return new ImageResponse(<LogoMark size={512} />, { width: 512, height: 512 })
}

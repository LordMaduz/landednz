// The brand mark for ImageResponse (share image, /logo.png); it renders outside the page CSS, so colours are the token hex (CW01 exemption).
export function LogoMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#0F2A3A" />
      <path d="M4 15.5c2.6-.9 4.2-3.6 8-3.6s5.4 2.7 8 3.6" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6.5 19c1.9-.6 3-2.2 5.5-2.2s3.6 1.6 5.5 2.2" stroke="#FFFFFF" strokeOpacity=".55" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16.5" cy="7.5" r="2" fill="#3FC9B7" />
    </svg>
  )
}

// Only same-origin paths: blocks open redirects via ?redirect=//evil.com or /\evil.com.
export function safeRedirect(value: string | null | undefined): string {
  return value && /^\/(?![/\\])/.test(value) ? value : '/app'
}

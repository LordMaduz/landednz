const BASE = 'http://local.invalid'

// Only same-origin paths. Resolving with URL (not a regex) also catches /\t/evil.com,
// which the browser's URL parser turns into //evil.com.
export function safeRedirect(value: string | null | undefined): string {
  if (!value?.startsWith('/')) return '/app'
  const url = new URL(value, BASE)
  return url.origin === BASE ? url.pathname + url.search + url.hash : '/app'
}

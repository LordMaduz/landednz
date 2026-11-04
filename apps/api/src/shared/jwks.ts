import { createRemoteJWKSet } from 'jose'
import { config } from './config.js'

// One Supabase JWKS for every JWT check. jose drops its copy after 10 min (cacheMaxAge), and the next sign-in then waits
// ~0.9 s on Supabase; reloading every 5 min keeps the same max age without that wait. A new key id still reloads at once.
export const JWKS = createRemoteJWKSet(new URL(`${config.supabaseUrl}/auth/v1/.well-known/jwks.json`))
const warm = () => JWKS.reload().catch(() => {}) // a failed reload leaves jose to fetch on the next check, as before
warm()
setInterval(warm, 5 * 60_000).unref()

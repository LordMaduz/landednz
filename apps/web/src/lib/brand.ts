// The only place brand facts live: metadata, JSON-LD and /about read from here.
const bioShort = "Your step-by-step settling-in roadmap for New Zealand, checked against official sources."

export const BRAND = {
  name: "LandedNZ",
  alternateNames: ["Landed NZ", "LandedNZ.co.nz"],
  bioShort,
  bioLong: `${bioShort} Ask about any task and get answers cited from official New Zealand sites.`,
  logoPath: "/logo.png",
  email: "hello@landednz.co.nz",
  // Live profile URLs; adding one is a one-line change.
  sameAs: [] as readonly string[],
} as const

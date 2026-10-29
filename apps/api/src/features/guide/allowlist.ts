// Official sources the guide may read live (spec §4.3). Subdomains are covered.
export const OFFICIAL_ALLOWLIST: readonly string[] = [
  'govt.nz', 'ird.govt.nz', 'immigration.govt.nz', 'tenancy.govt.nz', 'acc.co.nz', 'healthnz.govt.nz',
  'info.health.nz', 'nzta.govt.nz', 'employment.govt.nz', 'workandincome.govt.nz', 'sorted.org.nz',
  'nzqa.govt.nz', 'education.govt.nz', 'kiwisaver.govt.nz',
];

export function isAllowedHost(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && OFFICIAL_ALLOWLIST.some((d) => u.hostname === d || u.hostname.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

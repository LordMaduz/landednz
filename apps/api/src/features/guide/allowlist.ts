// Official sources the guide may read live (spec §4.3). Subdomains are covered.
export const OFFICIAL_ALLOWLIST: readonly string[] = [
  'govt.nz', 'ird.govt.nz', 'immigration.govt.nz', 'tenancy.govt.nz', 'acc.co.nz', 'healthnz.govt.nz',
  'info.health.nz', 'nzta.govt.nz', 'employment.govt.nz', 'workandincome.govt.nz', 'sorted.org.nz',
  'nzqa.govt.nz', 'education.govt.nz', 'kiwisaver.govt.nz',
];

// Blocks plain fetch (403, 2026-10-30); its guide chunks still answer. Release 2: ask NEMA to allow the bot.
export const GUIDE_ONLY_HOSTS: readonly string[] = ['getready.govt.nz'];

const onList = (host: string, list: readonly string[]) => list.some((d) => host === d || host.endsWith(`.${d}`));

export function isAllowedHost(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && onList(u.hostname, OFFICIAL_ALLOWLIST) && !onList(u.hostname, GUIDE_ONLY_HOSTS);
  } catch {
    return false;
  }
}

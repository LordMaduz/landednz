// The one-line trace under an AI reply: the NZ sources it names, else the knowledge base.
// Like chat-parser's extractSources, but keeps subdomains (myir.ird.govt.nz).
const NZ_DOMAIN = /\b(?:[a-z0-9-]+\.)+(?:govt|co|org|ac)\.nz\b/gi

export function traceFor(replyText: string): string {
  const domains = [...new Set(replyText.match(NZ_DOMAIN)?.map(d => d.toLowerCase()) ?? [])]
  return domains.length ? `Checked ${domains.join(', ')}` : 'Answered from the LandedNZ knowledge base'
}

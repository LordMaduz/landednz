// KB steps come from markdown with nested bullets collapsed into one line ("You will need: - A - B")
// and bold markers left in. The sheet shows a lead line with the items as a list.
// shortcut: " - " between words is read as a list item, upgrade to structured steps in the seed if prose ever uses it
export function stepParts(step: string): { lead: string; items: string[] } {
  const [lead, ...items] = step.replaceAll('**', '').split(/\s+-\s+/)
  return { lead: lead.trim(), items: items.map(i => i.trim()).filter(Boolean) }
}

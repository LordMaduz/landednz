export type PhonePart = string | { tel: string; text: string }

// NZ freephone numbers: 0800 xxx xxx, 0800 xx xx xx and 0508 …
const PHONE = /\b((?:0800|0508)(?: \d{3} \d{3}| \d{2} \d{2} \d{2}))\b/

// Splits text so each freephone number can be a tel: link; `tel` is the digits only
export function linkPhones(text: string): PhonePart[] {
  return text
    .split(PHONE)
    .map((part, i): PhonePart => (i % 2 ? { tel: part.replaceAll(' ', ''), text: part } : part))
    .filter(part => part !== '')
}

import type { Condition, Profile } from './types.js';

const FIELD: Record<string, keyof Profile> = {
  visa: 'visaType',
  city: 'city',
  family: 'familySituation',
  occupation: 'occupation',
};

export function matches(when: Condition | undefined, profile: Profile): boolean {
  if (when === undefined || when === 'all') return true;
  if ('any' in when) return (when.any as Condition[]).some((c) => matches(c, profile));
  if ('not' in when) return !matches(when.not as Condition, profile);
  return Object.entries(when).every(([key, values]) => {
    const field = FIELD[key];
    return field !== undefined && (values as string[]).includes(profile[field]);
  });
}

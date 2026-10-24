// Task titles and topics as the approved boards show them (docs/design/r0-boards/build_roadmap.py).
// title: the task as an action; topic: "Ask about <topic>", "Needs <topic> first";
// brief: the noun phrase in Home's next line ("Month 1 brings a rental, a GP, …").
export interface TaskCopy {
  title: string
  topic: string
  brief: string
  actionLabel?: string
}

export const TASK_COPY: Record<string, TaskCopy> = {
  T01: { title: 'Research Auckland suburbs', topic: 'suburbs', brief: 'a suburb to live in' },
  T02: { title: 'Book temporary accommodation', topic: 'temporary accommodation', brief: 'somewhere to stay first' },
  T03: { title: 'Prepare your overseas bank account', topic: 'your overseas account', brief: 'your overseas bank account' },
  T04: { title: 'Insure your move', topic: 'moving insurance', brief: 'moving insurance' },
  T05: { title: 'Sort your home-country tax', topic: 'home-country tax', brief: 'your home-country tax' },
  T06: { title: 'Get an NZ SIM card', topic: 'SIM cards', brief: 'an NZ SIM card' },
  T07: { title: 'Open a bank account', topic: 'bank accounts', brief: 'a bank account' },
  T08: { title: 'Apply for your IRD number', topic: 'your IRD number', brief: 'your IRD number', actionLabel: 'Open the IRD application' },
  T09: { title: 'Give your employer a tax code (IR330)', topic: 'your tax code', brief: 'your tax code', actionLabel: 'Open the IR330 form' },
  T10: { title: 'Choose your KiwiSaver fund', topic: 'KiwiSaver', brief: 'KiwiSaver' },
  T11: { title: 'Sign a rental and lodge the bond', topic: 'renting', brief: 'a rental' },
  T12: { title: 'Register with a GP', topic: 'GPs', brief: 'a GP', actionLabel: 'Find a GP near you' },
  T13: { title: 'Learn how ACC covers injuries', topic: 'ACC', brief: 'ACC' },
  T14: { title: 'Know your rights as a tenant', topic: 'tenant rights', brief: 'your rights as a tenant' },
  T15: { title: 'Set up money transfers home', topic: 'sending money home', brief: 'money transfers home' },
  T16: { title: 'Convert your driving licence', topic: 'driving licences', brief: 'your driving licence' },
  T17: { title: 'Get your qualifications recognised', topic: 'NZQA', brief: 'your qualifications' },
  T18: { title: 'Build an NZ credit history', topic: 'credit history', brief: 'an NZ credit history' },
  T19: { title: 'Update your CV and LinkedIn for NZ', topic: 'CVs', brief: 'your CV' },
  T20: { title: 'Review your KiwiSaver fund', topic: 'KiwiSaver reviews', brief: 'a KiwiSaver review' },
  T21: { title: 'Open a joint bank account', topic: 'joint accounts', brief: 'a joint account' },
}

// KB task names are not user-facing titles; fall back to them only for unknown ids
export function taskTitle(id: string, fallback: string): string {
  return TASK_COPY[id]?.title ?? fallback
}

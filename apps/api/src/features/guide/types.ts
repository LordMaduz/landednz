// Settlement guide types shared by the pipeline steps and the prompt registry.

import type { ReplyPart } from '@landednz/types';
import type { City, FamilySituation, Occupation, VisaType } from '../../generated/prisma/enums.js';

// Out-of-scope redirect targets; the registry maps each to vetted copy, so model text never reaches the user
export const GUIDE_AGENCIES = ['immigration', 'health', 'employment', 'money'] as const;
export type GuideAgency = (typeof GUIDE_AGENCIES)[number];

export type TaskRef = { taskKey: string; title: string };

export type GuideContext = {
  userName: string | null;
  profile: {
    visaType: VisaType;
    city: City;
    familySituation: FamilySituation;
    occupation: Occupation;
    arrivalDate: Date;
  };
  daysSinceArrival: number;
  today: string; // e.g. 'Friday, 30 October 2026', NZ time
  doneTasks: TaskRef[];
  nextTasks: TaskRef[];
  totalTasks: number;
  currentTask: TaskRef | null;
  memories: { id: string; text: string }[];
  taskTitles: Map<string, string>;
};

export type Understanding = {
  searchQuery: string;
  scope: 'in' | 'out';
  redirectAgency: GuideAgency | null;
  needsLive: boolean;
  distress: boolean;
  memoryCandidates: { text: string; sensitive: boolean; explicit: boolean }[];
};

export type Passage = {
  id: string;
  title: string;
  url: string;
  origin: 'guide' | 'official';
  content: string;
  similarity: number;
  taskKey: string | null;
  checkedAt: string;
};

export type ReleasedSentence = { text: string; citations: { passageIndex: number; citedText: string }[] };

export type VerifyResult = { unmatchedCitations: number; uncitedClaims: string[]; note: ReplyPart | null };

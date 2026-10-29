// Settlement guide types shared by the pipeline steps and the prompt registry (interface-only).

import type { ReplyPart } from '@landednz/types';
import type { City, FamilySituation, Occupation, VisaType } from '../../generated/prisma/enums.js';

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
  redirectAgency: string | null;
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

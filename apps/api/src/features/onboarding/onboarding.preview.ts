// Public roadmap preview — the five onboarding answers in, the filtered task list out,
// so the preview before sign-up is the real roadmap (spec §4.3 amendment). No auth, no writes.

import { db } from '../../shared/db.js';
import { AppError } from '../../shared/errors.js';
import { filterApplicableTasks } from '../../core/priority/filter.js';
import { City, FamilySituation, Occupation, VisaType } from '../../generated/prisma/enums.js';
import type { OnboardingPreviewRequest, OnboardingPreviewResponse } from './onboarding.types.js';

// A real calendar date in YYYY-MM-DD form (rejects 2026-13-40 and 2026-02-30)
function isCalendarDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

const oneOf = (values: Record<string, string>, value: unknown) =>
  typeof value === 'string' && Object.values(values).includes(value);

export function parsePreviewRequest(body: unknown): OnboardingPreviewRequest {
  const b = (body ?? {}) as Record<string, unknown>;
  if (
    !oneOf(VisaType, b.visaType) ||
    !oneOf(City, b.city) ||
    !oneOf(FamilySituation, b.familySituation) ||
    !oneOf(Occupation, b.occupation) ||
    !isCalendarDate(b.arrivalDate)
  ) {
    throw new AppError(
      'VALIDATION_ERROR',
      'visaType, city, familySituation and occupation must be known values; arrivalDate must be a real YYYY-MM-DD date',
      400,
    );
  }
  return {
    visaType: b.visaType,
    city: b.city,
    familySituation: b.familySituation,
    occupation: b.occupation,
    arrivalDate: b.arrivalDate,
  } as OnboardingPreviewRequest;
}

export async function previewRoadmap(answers: OnboardingPreviewRequest): Promise<OnboardingPreviewResponse> {
  const tasks = await db.task.findMany({ orderBy: { id: 'asc' } });
  const applicable = filterApplicableTasks({ tasks, profile: answers }) as typeof tasks;
  return {
    tasks: applicable.map(t => ({
      taskId: t.id,
      name: t.name,
      estimatedDuration: t.estimatedDuration,
      phase: t.phase,
    })),
  };
}

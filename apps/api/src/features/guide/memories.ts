// Memory CRUD for "What the guide remembers" (spec §6.4). Another user's memory is reported as missing.
import type { GuideMemoryDto } from '@landednz/types';
import { db } from '../../shared/db.js';
import { AppError } from '../../shared/errors.js';

const MAX_TEXT_CHARS = 200;

const toDto = (m: { id: string; text: string; createdAt: Date; updatedAt: Date }): GuideMemoryDto => ({
  id: m.id,
  text: m.text,
  createdAt: m.createdAt.toISOString(),
  updatedAt: m.updatedAt.toISOString(),
});

const notFound = () => new AppError('MEMORY_NOT_FOUND', 'Memory not found', 404);

export async function listMemories(userId: string): Promise<GuideMemoryDto[]> {
  const rows = await db.guideMemory.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  return rows.map(toDto);
}

export async function updateMemory(userId: string, id: string, text: string): Promise<GuideMemoryDto> {
  const trimmed = text.trim();
  if (trimmed.length < 1 || trimmed.length > MAX_TEXT_CHARS) {
    throw new AppError('VALIDATION_ERROR', `Memory text must be 1 to ${MAX_TEXT_CHARS} characters`, 400);
  }
  const { count } = await db.guideMemory.updateMany({ where: { id, userId }, data: { text: trimmed, editedByUser: true } });
  if (count === 0) throw notFound();
  return toDto(await db.guideMemory.findUniqueOrThrow({ where: { id } }));
}

export async function deleteMemory(userId: string, id: string): Promise<void> {
  const { count } = await db.guideMemory.deleteMany({ where: { id, userId } });
  if (count === 0) throw notFound();
}

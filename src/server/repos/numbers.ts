import 'server-only';
import { db } from '../db';
import type { NumberCfg } from '@/types/core';

export async function getNumbers(workspaceId: string): Promise<NumberCfg[]> {
  const numbers = await db.number.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
  });

  return numbers as NumberCfg[];
}

export async function getNumberById(workspaceId: string, numberId: string): Promise<NumberCfg | null> {
  const number = await db.number.findFirst({
    where: {
      id: numberId,
      workspaceId,
    },
  });

  return number as NumberCfg | null;
}

export async function getNumberByE164(workspaceId: string, e164: string): Promise<NumberCfg | null> {
  const number = await db.number.findFirst({
    where: {
      e164,
      workspaceId,
    },
  });

  return number as NumberCfg | null;
}

export async function createNumber(data: Omit<NumberCfg, 'id' | 'createdAt' | 'updatedAt'>): Promise<NumberCfg> {
  const number = await db.number.create({
    data,
  });

  return number as NumberCfg;
}

export async function updateNumber(
  workspaceId: string, 
  numberId: string, 
  data: Partial<NumberCfg>
): Promise<NumberCfg> {
  const updatedNumber = await db.number.update({
    where: {
      id: numberId,
      workspaceId,
    },
    data,
  });

  return updatedNumber as NumberCfg;
}

export async function deleteNumber(workspaceId: string, numberId: string): Promise<void> {
  await db.number.delete({
    where: {
      id: numberId,
      workspaceId,
    },
  });
}

export async function getActiveNumbers(workspaceId: string): Promise<NumberCfg[]> {
  const numbers = await db.number.findMany({
    where: {
      workspaceId,
      status: 'active',
    },
    orderBy: { createdAt: 'desc' },
  });

  return numbers as NumberCfg[];
}
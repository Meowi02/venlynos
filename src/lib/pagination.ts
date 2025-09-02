import { z } from "zod";

export const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

export interface PaginatedResult<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
  total?: number;
}

export function encodeCursor(value: string | number | Date): string {
  const stringValue = typeof value === 'string' ? value : value.toString();
  return Buffer.from(stringValue).toString('base64url');
}

export function decodeCursor(cursor: string): string {
  try {
    return Buffer.from(cursor, 'base64url').toString('utf8');
  } catch {
    throw new Error('Invalid cursor format');
  }
}

export function createPaginatedResponse<T>(
  data: T[],
  limit: number,
  getNextCursor?: (item: T) => string,
  total?: number
): PaginatedResult<T> {
  const hasMore = data.length === limit;
  const nextCursor = hasMore && getNextCursor && data.length > 0 
    ? encodeCursor(getNextCursor(data[data.length - 1])) 
    : undefined;

  return {
    data,
    nextCursor,
    hasMore,
    total,
  };
}
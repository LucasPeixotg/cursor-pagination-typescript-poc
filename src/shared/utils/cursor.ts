import { createHmac, timingSafeEqual } from 'crypto';
import { BadRequestError } from '../http-errors.js';

function requireSecret(): string {
  const secret = process.env.CURSOR_SECRET;
  if (!secret) throw new Error('CURSOR_SECRET environment variable is required');
  return secret;
}

const SECRET = requireSecret();

export interface CursorPayload {
  // Sort columns — required for the keyset query
  createdAt: string;    // full-precision timestamp string (preserves microseconds)
  id:         string;    // unique tiebreaker
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    nextCursor: string | null;
    previousCursor: string | null;
    hasMore: boolean;
  };
}

export function encodeCursor(payload: CursorPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig  = createHmac('sha256', SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

export function decodeCursor(cursor: string): CursorPayload {
  const dot = cursor.lastIndexOf('.');
  if (dot === -1) throw new Error('Invalid cursor');

  const data = cursor.slice(0, dot);
  const sig  = cursor.slice(dot + 1);

  const expected = createHmac('sha256', SECRET).update(data).digest('base64url');

  // Constant-time compare — prevents timing attacks
  const a = Buffer.from(sig,      'base64url');
  const b = Buffer.from(expected, 'base64url');
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new BadRequestError("Invalid or expired pagination cursor.")
  }

  const payload = JSON.parse(Buffer.from(data, 'base64url').toString());
  // Keep createdAt as the verbatim full-precision string so the keyset
  // comparison stays exact (a JS Date would truncate microseconds → re-matches).
  return payload;
}
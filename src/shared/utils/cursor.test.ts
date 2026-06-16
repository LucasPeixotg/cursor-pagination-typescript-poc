// ponytail: smallest runnable check for the keyset cursor — roundtrip + tamper.
// Run against built output: `npm run build && CURSOR_SECRET=test node dist/shared/utils/cursor.test.js`
import assert from 'node:assert';
import test from 'node:test';
import { encodeCursor, decodeCursor } from './cursor.js';

test('encode → decode roundtrips the keyset fields verbatim', () => {
  const payload = { createdAt: '2026-06-16 12:00:00.123456', id: 'abc-123' };
  const decoded = decodeCursor(encodeCursor(payload));
  assert.deepStrictEqual(decoded, payload);
});

test('tampered cursor is rejected (HMAC check)', () => {
  const cursor = encodeCursor({ createdAt: '2026-06-16 12:00:00', id: 'a' });
  const tampered = cursor.slice(0, -1) + (cursor.at(-1) === 'A' ? 'B' : 'A');
  assert.throws(() => decodeCursor(tampered), /Invalid or expired/);
});

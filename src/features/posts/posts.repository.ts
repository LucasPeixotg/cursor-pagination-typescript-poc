import { or, lt, desc, and, eq } from 'drizzle-orm'
import { db } from '../../shared/db/client.js'
import { posts } from '../../shared/db/schema.js'

import type { CursorPayload } from '../../shared/utils/cursor.js'

export type PostRecord = typeof posts.$inferSelect

export const postsRepository = {
  // Newest-first keyset. cursor === null fetches the first page.
  async fetch(cursor: CursorPayload | null, pageSize: number = 20): Promise<PostRecord[]> {
    return db
      .select()
      .from(posts)
      .where(cursor ? or(
        lt(posts.createdAt, cursor.createdAt),
        and(eq(posts.createdAt, cursor.createdAt), lt(posts.id, cursor.id)),
      ) : undefined)
      .limit(pageSize)
      .orderBy(desc(posts.createdAt), desc(posts.id));
  }
}

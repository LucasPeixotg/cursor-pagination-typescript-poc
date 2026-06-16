import { or, gt, asc, desc, and, eq } from 'drizzle-orm'
import { db } from '../../shared/db/client.js'
import { posts } from '../../shared/db/schema.js'

import type { CursorPayload } from "../../shared/utils/cursor.js"

export type PostRecord = typeof posts.$inferSelect

export const postsRepository = {
  async fetch(pageSize: number = 20): Promise<PostRecord[]> {
    return db
      .select()
        .from(posts)
        .limit(pageSize)
        .orderBy(asc(posts.createdAt), asc(posts.id));
  },

  async fetchNextPage(cursor: CursorPayload, pageSize: number = 20): Promise<PostRecord[]> {
    return db
        .select()
        .from(posts)
        .where(or(
            gt(posts.createdAt, cursor.createdAt),
            and(eq(posts.createdAt, cursor.createdAt), gt(posts.id, cursor.id)),
        ))
        .limit(pageSize)
        .orderBy(desc(posts.createdAt), desc(posts.id));
  }
}
import { pgTable, uuid, text, varchar, timestamp } from 'drizzle-orm/pg-core'

export const posts = pgTable('posts', {
  id:        uuid('id').primaryKey().defaultRandom(),
  imageUrl:  varchar('image_url'),
  title:     text('title').notNull(),
  body:      text('body').notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
});

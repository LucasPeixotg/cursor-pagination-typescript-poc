import { pgTable, uuid, text, varchar, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id:           uuid('id').primaryKey().defaultRandom(),
  username:     text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt:    timestamp('created_at').notNull().defaultNow(),
});

export const posts = pgTable('posts', {
  id:        uuid('id').primaryKey().defaultRandom(),
  userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  imageUrl:  varchar('image_url'),
  title:     text('title').notNull(),
  body:      text('body').notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
});

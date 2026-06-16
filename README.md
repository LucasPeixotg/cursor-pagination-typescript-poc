# Cursor Pagination POC

A small proof of concept to understand how to implement **cursor (keyset) pagination** with
**TypeScript + Express + Drizzle (PostgreSQL)**.

Instead of `OFFSET`/`LIMIT` (which gets slower as you skip more rows and can skip/repeat items when
data changes), this POC paginates using a stable composite key (`created_at`, `id`) and an opaque,
signed cursor.

> 📚 For the concepts and trade-offs behind this approach, see the companion notes:
> [API Best Practices — Pagination](https://lucaspeixotg.github.io/DevelopmentLearningVault/api-best-practices/pagination/).

## Tech stack

- **Express 5** — HTTP server
- **Drizzle ORM** + **pg** — PostgreSQL access
- **Zod** — query param validation
- **Helmet** + **CORS** — basic security
- Dev: **TypeScript**, **nodemon**, **tsx**

## How to run

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file (the quickest way is `cp .env.example .env`) and fill in the variables:

   ```bash
   # App
   PORT=3000                                              # server port (default 3000)
   TARGET=development                                     # docker build target: development | production
   DATABASE_URL=postgres://user:pass@db:5432/mydb         # Postgres connection string
   ALLOWED_ORIGIN=http://localhost:3000                   # CORS allowed origin
   CURSOR_SECRET=some-long-random-string                  # HMAC secret for signing cursors

   # Postgres container (used by docker-compose)
   POSTGRES_DB=cursor-poc                                 # database name
   POSTGRES_USER=cursor-poc-user                          # database user
   POSTGRES_PASSWORD=some-strong-password                 # database password
   ```

3. Make sure a PostgreSQL instance is running with the `users` and `posts` tables.
   The table definitions live in [src/shared/db/schema.ts](src/shared/db/schema.ts).

4. Start the server:

   ```bash
   npm run dev          # watch mode (nodemon)
   # or
   npm run build && npm start
   ```

5. Try it out:

   ```bash
   # first page
   GET http://localhost:3000/posts

   # next page (use the nextCursor returned by the previous response)
   GET http://localhost:3000/posts?cursor=<nextCursor>
   ```

   Response shape:

   ```json
   {
     "data": [ /* ...posts... */ ],
     "pagination": {
       "nextCursor": "eyJ...signed...",
       "previousCursor": null,
       "hasMore": true
     }
   }
   ```

## How cursor pagination works here

1. **Stable ordering** — rows are ordered by a composite key (`created_at`, `id`). The `id`
   tiebreaker guarantees a deterministic order even when timestamps collide.
2. **Fetch one extra row** — the query asks for `pageSize + 1` rows. If the extra row exists, there
   is another page (`hasMore = true`), and it gets sliced off before responding.
   See [src/features/posts/posts.controller.ts](src/features/posts/posts.controller.ts).
3. **Build the cursor** — the cursor encodes the last row's `{ createdAt, id }` as base64url and signs
   it with HMAC-SHA256 (`CURSOR_SECRET`). This makes it opaque and tamper-proof.
   See [src/shared/utils/cursor.ts](src/shared/utils/cursor.ts).
4. **Next page is a keyset query** — the cursor is decoded and signature-verified, then used in a
   keyset `WHERE` clause: everything *after* `(created_at, id)`:

   ```sql
   WHERE created_at > :createdAt
      OR (created_at = :createdAt AND id > :id)
   ```

   See [src/features/posts/posts.repository.ts](src/features/posts/posts.repository.ts).
5. **Respond** — return `data` plus `pagination { nextCursor, hasMore }`. When there are no more
   rows, `nextCursor` is `null`.

## Folder architecture

The project uses a **feature-based + layered** layout: each feature is a vertical slice with its own
layers, while cross-cutting concerns live under `shared/`.

```
src/
├── app.ts                  # wires global middleware + routers
├── server.ts               # starts the HTTP listener
├── features/
│   └── posts/              # one feature = one vertical slice
│       ├── posts.routes.ts       # routes + middleware wiring
│       ├── posts.controller.ts   # request/response orchestration
│       ├── posts.repository.ts   # DB queries (Drizzle)
│       └── posts.schemas.ts      # Zod schemas + types
└── shared/                 # cross-cutting, reused across features
    ├── db/                 # Drizzle client + table schema
    ├── middleware/         # query validation, error handler, logger
    ├── utils/              # cursor encode/decode
    ├── http-errors.ts      # typed HTTP error classes
    └── types/              # shared type declarations
```

**Request flow:** `route → validation middleware → controller → repository → database`

- **`app.ts`** registers global middleware (helmet, cors, json, logger) and mounts routers, then the
  error handler last.
- **`server.ts`** only starts the listener — keeping it separate makes `app` easy to import/test.

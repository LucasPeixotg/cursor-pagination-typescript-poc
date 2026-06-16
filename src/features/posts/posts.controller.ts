import type { Request, Response, NextFunction } from 'express';
import type { FetchPostsQuery, PostsResponse } from './posts.schemas.js';

import { encodeCursor, decodeCursor } from '../../shared/utils/cursor.js';
import { postsRepository } from './posts.repository.js';

const PAGE_SIZE = 20;

export const fetchPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cursor } = req.validatedQuery as FetchPostsQuery;

    // Fetch one extra row to detect whether another page exists.
    const limit = PAGE_SIZE + 1;
    const rows = await postsRepository.fetch(cursor ? decodeCursor(cursor) : null, limit);

    const hasMore = rows.length > PAGE_SIZE;
    const data = hasMore ? rows.slice(0, PAGE_SIZE) : rows;

    const last = data[data.length - 1];
    const nextCursor =
      hasMore && last ? encodeCursor({ createdAt: last.createdAt, id: last.id }) : null;

    const response: PostsResponse = {
      data,
      pagination: {
        nextCursor,
        previousCursor: null,
        hasMore,
      },
    };

    res.json(response);
  } catch (err) {
    next(err);
  }
};

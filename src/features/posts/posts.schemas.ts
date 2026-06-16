import { z } from 'zod';

import type { PaginatedResponse } from '../../shared/utils/cursor.js';
import type { PostRecord } from './posts.repository.js';

export const fetchPostsQuerySchema = z.object({
  cursor: z.string().optional(),
});


export type FetchPostsQuery = z.infer<typeof fetchPostsQuerySchema>;
export type PostsResponse = PaginatedResponse<PostRecord>;
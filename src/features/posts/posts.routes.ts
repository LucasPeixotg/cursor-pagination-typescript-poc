import { Router } from 'express';
import { withQueryValidation } from '../../shared/middleware/withQueryValidation.js';

import { fetchPosts } from './posts.controller.js';
import { fetchPostsQuerySchema } from './posts.schemas.js';

const postsRouter = Router();

postsRouter.get('/', withQueryValidation(fetchPostsQuerySchema), fetchPosts);

export default postsRouter;
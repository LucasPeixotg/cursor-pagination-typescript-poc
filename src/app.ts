// Libraries
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'

// Custom middlewares
import { errorHandler } from './shared/middleware/errorHandler.js'
import { requestLogger } from './shared/middleware/logger.js'

// Routers
import postsRouter from './features/posts/posts.routes.js'

const app = express();

// Security & parsing (global — runs on every request)
app.use(helmet())
app.use(cors({ origin: process.env.ALLOWED_ORIGIN }))
app.use(express.json())
app.use(requestLogger)

// Routers setup
app.use("/posts", postsRouter)

// Error handler — MUST be last
app.use(errorHandler)

export default app;

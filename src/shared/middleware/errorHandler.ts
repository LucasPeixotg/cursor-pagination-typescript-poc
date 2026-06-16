import type { ErrorRequestHandler, Request, Response, NextFunction } from 'express'
import { HttpError, InternalServerError, ValidationError } from '../http-errors.js'

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (!(err instanceof HttpError)) {
    console.error(err)
    res
      .status(500)
      .contentType('application/problem+json')
      .json({
        type: new InternalServerError().type,
        title: 'An unexpected error occurred',
        status: 500,
        detail: 'The server encountered an error. Please try again later.',
        instance: req.path,
      })
    return
  }

  const body: Record<string, unknown> = {
    type: err.type,
    title: err.title,
    status: err.statusCode,
    detail: err.message,
    instance: req.path,
  }

  if (err instanceof ValidationError) {
    body['errors'] = err.errors
  }

  res.status(err.statusCode).contentType('application/problem+json').json(body)
}

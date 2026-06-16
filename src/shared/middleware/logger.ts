import type { RequestHandler } from 'express'

export const requestLogger: RequestHandler = (req, res, next) => {
  res.on('finish', () => {
    console.log(`${req.method} ${req.path} ${res.statusCode}`)
  })
  next()
}

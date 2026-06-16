// Augment Express's Request so middleware can attach a validated, typed copy
// of the query string (req.query itself is read-only in Express 5).
declare global {
  namespace Express {
    interface Request {
      validatedQuery?: unknown;
    }
  }
}

export {};

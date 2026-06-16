import { ZodError } from 'zod';
import type { ZodType } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../http-errors.js';
import type { FieldError } from '../http-errors.js';

export const withQueryValidation = (schema: ZodType) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.validatedQuery = schema.parse(req.query);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors: FieldError[] = err.issues.map((issue) => ({
          field: issue.path.join('.') || '(root)',
          code: issue.code,
          message: issue.message,
        }));
        next(new ValidationError('One or more query params failed validation.', errors));
        return;
      }
      next(err);
    }
  };
};

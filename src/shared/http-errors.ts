export interface FieldError {
  field: string;
  code: string;
  message: string;
}

const BASE = process.env['ERROR_BASE_URL'] ?? '';
const typeUri = (slug: string) => (BASE ? `${BASE}/${slug}` : 'about:blank');

export class HttpError extends Error {
  readonly type: string;
  readonly title: string;

  constructor(
    public message: string,
    public statusCode: number = 500,
    type = typeUri('internal-error'),
    title = 'An unexpected error occurred',
  ) {
    super(message);
    this.name = this.constructor.name;
    this.type = type;
    this.title = title;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 4xx — client errors (the request was wrong)

export class BadRequestError extends HttpError {
  constructor(m = 'Bad request') {
    super(m, 400, typeUri('bad-request'), 'Bad request');
  }
}

export class UnauthorizedError extends HttpError {
  constructor(m = 'Authentication required') {
    super(m, 401, typeUri('unauthenticated'), 'Authentication required');
  }
}

export class ForbiddenError extends HttpError {
  constructor(m = 'Access forbidden') {
    super(m, 403, typeUri('forbidden'), 'Access forbidden');
  }
}

export class NotFoundError extends HttpError {
  constructor(m = 'Resource not found') {
    super(m, 404, typeUri('not-found'), 'Resource not found');
  }
}

export class MethodNotAllowedError extends HttpError {
  constructor(m = 'Method not allowed') {
    super(m, 405, typeUri('method-not-allowed'), 'Method not allowed');
  }
}

export class ConflictError extends HttpError {
  constructor(m = 'Conflict') {
    super(m, 409, typeUri('conflict'), 'Conflict');
  }
}

export class ValidationError extends HttpError {
  readonly errors: FieldError[];

  constructor(m = 'Validation failed', errors: FieldError[] = []) {
    super(m, 422, typeUri('validation-failed'), 'Validation failed');
    this.errors = errors;
  }
}

export class TooManyRequestsError extends HttpError {
  constructor(m = 'Too many requests') {
    super(m, 429, typeUri('rate-limit-exceeded'), 'Rate limit exceeded');
  }
}

// 5xx — server errors (something broke on our side)

export class InternalServerError extends HttpError {
  constructor(m = 'An unexpected error occurred') {
    super(m, 500, typeUri('internal-error'), 'An unexpected error occurred');
  }
}

export class NotImplementedError extends HttpError {
  constructor(m = 'Not implemented') {
    super(m, 501, typeUri('not-implemented'), 'Not implemented');
  }
}

export class ServiceUnavailableError extends HttpError {
  constructor(m = 'Service unavailable') {
    super(m, 503, typeUri('service-unavailable'), 'Service unavailable');
  }
}

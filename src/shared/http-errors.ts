export interface FieldError {
  field: string;
  code: string;
  message: string;
}

export class HttpError extends Error {
  readonly type: string;
  readonly title: string;

  constructor(
    public message: string,
    public statusCode: number = 500,
    type = 'about:blank',
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
    super(m, 400, 'about:blank', 'Bad request');
  }
}

export class ValidationError extends HttpError {
  readonly errors: FieldError[];

  constructor(m = 'Validation failed', errors: FieldError[] = []) {
    super(m, 422, 'about:blank', 'Validation failed');
    this.errors = errors;
  }
}

// 5xx — server errors (something broke on our side)

export class InternalServerError extends HttpError {
  constructor(m = 'An unexpected error occurred') {
    super(m, 500, 'about:blank', 'An unexpected error occurred');
  }
}

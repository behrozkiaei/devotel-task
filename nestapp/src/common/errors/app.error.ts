export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }

  static BadRequest(message: string, code = 'BAD_REQUEST', details?: any) {
    return new AppError(message, code, 400, details);
  }

  static NotFound(message: string, code = 'NOT_FOUND', details?: any) {
    return new AppError(message, code, 404, details);
  }

  static Database(message: string, code = 'DATABASE_ERROR', details?: any) {
    return new AppError(message, code, 500, details);
  }

  static External(message: string, code = 'EXTERNAL_SERVICE_ERROR', details?: any) {
    return new AppError(message, code, 503, details);
  }
} 
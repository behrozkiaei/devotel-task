import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { CustomLoggerService } from '../services/logger.service';
import { AppError } from '../errors/app.error';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new CustomLoggerService(HttpExceptionFilter.name);

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';
    let details = undefined;

    if (exception instanceof AppError) {
      status = exception.statusCode;
      message = exception.message;
      code = exception.code;
      details = exception.details;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    }

    this.logger.error(`${code}: ${message}`, exception.stack);

    response.status(status).json({
      statusCode: status,
      message,
      code,
      details,
      timestamp: new Date().toISOString(),
    });
  }
} 
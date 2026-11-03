import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

/** The single error shape returned by every endpoint. */
export interface ErrorResponse {
  statusCode: number;
  /** Human-readable message, or a list of messages for validation errors. */
  message: string | string[];
  /** Short name of the HTTP status, e.g. "Bad Request". */
  error: string;
  timestamp: string;
  path: string;
}

function statusName(status: number): string {
  const name = HttpStatus[status];
  if (!name) {
    return 'Error';
  }
  return name
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Converts every thrown error into ErrorResponse.
 * Unknown errors become a generic 500 so stack traces and internals never reach the client.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();
    const request = http.getRequest<Request>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = statusName(status);

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      error = statusName(status);
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else if (typeof body === 'object' && body !== null) {
        const fields = body as Record<string, unknown>;
        const bodyMessage = fields.message;
        if (typeof bodyMessage === 'string' || Array.isArray(bodyMessage)) {
          message = bodyMessage as string | string[];
        } else {
          message = exception.message;
        }
        if (typeof fields.error === 'string') {
          error = fields.error;
        }
      }
    } else {
      const detail = exception instanceof Error ? (exception.stack ?? exception.message) : String(exception);
      this.logger.error(`Unhandled error on ${request.method} ${request.originalUrl}`, detail);
    }

    const payload: ErrorResponse = {
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.originalUrl ?? request.url,
    };

    response.status(status).json(payload);
  }
}

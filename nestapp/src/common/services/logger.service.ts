import { Injectable, Logger, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class CustomLoggerService extends Logger {
  constructor(context: string = 'CustomLogger') {
    super(context);
  }

  debug(message: string, ...meta: any[]) {
    super.debug(`[DEBUG] ${message}`, ...meta);
  }

  error(message: string, stack?: string, ...meta: any[]) {
    super.error(`[ERROR] ${message}`, stack, ...meta);
  }

  warn(message: string, ...meta: any[]) {
    super.warn(`[WARN] ${message}`, ...meta);
  }

  info(message: string, ...meta: any[]) {
    super.log(`[INFO] ${message}`, ...meta);
  }
} 
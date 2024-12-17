import { BaseError } from './base.error';
import { ErrorType } from './error.type';

export class UnauthorizedError<T> extends BaseError<T> {
  constructor(message: string, additionalInfo?: T) {
    super(ErrorType.UnauthorizedError, message, additionalInfo);
  }
}

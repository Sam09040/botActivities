import { BaseError } from './base.error';
import { ErrorType } from './error.type';

export class NotFoundError<T> extends BaseError<T> {
  constructor(message: string, additionalInfo?: T) {
    super(ErrorType.NotFoundError, message, additionalInfo);
  }
}

import { BaseError } from './base.error';
import { ErrorType } from './error.type';

export class InvalidDataError<T> extends BaseError<T> {
  constructor(message: string, additionalInfo?: T) {
    super(ErrorType.InvalidDataError, message, additionalInfo);
  }
}

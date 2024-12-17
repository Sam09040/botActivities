import { BaseError } from './base.error';
import { ErrorType } from './error.type';

export class DatasourceError<T> extends BaseError<T> {
  constructor(message: string, additionalInfo?: T) {
    super(ErrorType.DatasourceError, message, additionalInfo);
  }
}

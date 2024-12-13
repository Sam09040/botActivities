import { ErrorType, StatusCode } from './error.type';

export class BaseError<T = any> extends Error {
  code: ErrorType | StatusCode;
  additionalInfo?: T;

  constructor(type: ErrorType | StatusCode, message: string, additionalInfo?: T) {
    super(message);
    this.code = type;
    this.additionalInfo = additionalInfo;
    Object.setPrototypeOf(this, BaseError.prototype);
  }
}

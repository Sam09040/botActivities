import { ErrorType, StatusCode } from './error.type';

export const BaseErrorToken = Symbol();
export class BaseError<T = any> extends Error {
  [BaseErrorToken] = true;
  code: ErrorType | StatusCode;
  additionalInfo?: T;

  constructor(type: ErrorType | StatusCode, message: string, additionalInfo?: T) {
    super(message);
    this.code = type;
    this.additionalInfo = additionalInfo;
    Object.setPrototypeOf(this, BaseError.prototype);
  }
}

export function isBaseError(error: any): error is BaseError {
  return error?.[BaseErrorToken] ?? false;
}

export enum StatusCode {
  Success = 200,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  ServerError = 500,
}

export enum ErrorType {
  DataSourceError = StatusCode.ServerError,
  ForbiddenError = StatusCode.Forbidden,
  InvalidDataError = StatusCode.BadRequest,
  NotFoundError = StatusCode.NotFound,
  ServerError = StatusCode.ServerError,
  UnauthorizedError = StatusCode.Unauthorized,
}

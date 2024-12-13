import { BaseError } from '@core/error';
import { GraphQLError } from 'graphql';

export interface ServerError {
  code?: number;
  message?: string;
  additionalInfo?: AdditionalInfo;
}

export interface AdditionalInfo {
  field?: string;
  reason?: string;
}

export function errorFormatter(error: GraphQLError) {
  const { originalError } = error;
  if (originalError instanceof BaseError) {
    const { code, message, additionalInfo } = originalError;
    return {
      code,
      message,
      additionalInfo,
    };
  }
  return error;
}

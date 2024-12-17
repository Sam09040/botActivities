import { BaseError, ErrorType } from '@core/error';
import { ApolloServerErrorCode } from '@apollo/server/errors';
import { GraphQLError } from 'graphql';
import { ValidationError } from 'apollo-server';

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

  if (error.extensions?.code === ApolloServerErrorCode.BAD_USER_INPUT) {
    return {
      message: 'Check the fields again! Some may be missing!',
      code: ErrorType.InvalidDataError,
      additionalInfo: error.extensions?.code,
    };
  }

  return error;
}

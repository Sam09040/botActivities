import { BaseError, ErrorType } from '@core/error';
import { ApolloServerErrorCode, unwrapResolverError } from '@apollo/server/errors';
import { ValidationError } from 'class-validator';
import { GraphQLFormattedError } from 'graphql';

export interface ServerError {
  code?: number;
  message?: string;
  additionalInfo?: AdditionalInfo;
}

export interface AdditionalInfo {
  field?: string;
  reason?: string;
}

function parseValidationError(errors: ValidationError[]) {
  return errors.map((validationError) => ({
    property: validationError.property,
    constraints: validationError.constraints,
  }));
}

export function errorFormatter(formattedError: GraphQLFormattedError, error: unknown) {
  const unwrappedError = unwrapResolverError(error);
  if (unwrappedError instanceof BaseError) {
    const { code, message, additionalInfo } = unwrappedError;
    return {
      code,
      message,
      additionalInfo,
    };
  }
  if (formattedError.extensions?.code === ApolloServerErrorCode.BAD_USER_INPUT) {
    const validationErrors = formattedError.extensions?.validationErrors;
    if (!validationErrors) {
      return {
        message: 'Check the fields again! Some may be missing!',
        code: ErrorType.InvalidDataError,
        additionalInfo: {
          field: 'file',
          reason: 'Fields are missing!'
        }
      };
    }
    return {
      message: 'Check the fields again! They might be wrong or missing.',
      code: ErrorType.InvalidDataError,
      additionalInfo: parseValidationError(validationErrors as ValidationError[]),
    };
  }

  return formattedError;
}

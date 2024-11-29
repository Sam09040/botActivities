import { AuthenticationError } from 'apollo-server';
import { verifyToken } from '../../validation/validation';
import { CustomError } from '../../errors/CustomError';
import 'dotenv/config';
import { findUserById } from '../../user/user.db.datasource';

export const userQuery = (id: number, token: string | undefined) => {
  if (!token) {
    throw new AuthenticationError('Token is required for this operation!', {
      http_status: '400',
      field: 'authorization',
      reason: 'A valid token must be provided.',
    });
  }

  verifyToken(token);

  const user = findUserById(id);
  if (user === null) {
    throw new CustomError('404', 'User not found!', {
      field: 'id',
      reason: 'The provided id does not exist.',
    });
  }

  return user;
};

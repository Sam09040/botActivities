import { AuthenticationError } from 'apollo-server';
import { CustomError } from '../../../core/errors/CustomError';
import 'dotenv/config';
import { findUserById } from '../../../data/user/user.db.datasource';
import { verifyToken } from '../../../core/security/validation/validation';
import { User } from '../../../domain/interfaces';

export const userQuery = async (id: number, token: string | undefined): Promise<User> => {
  if (!token) {
    throw new AuthenticationError('Token is required for this operation!', {
      http_status: '400',
      field: 'authorization',
      reason: 'A valid token must be provided.',
    });
  }

  verifyToken(token);

  const user = await findUserById(id);
  if (!user) {
    throw new CustomError('404', 'User not found!', {
      field: 'id',
      reason: 'The provided id does not exist.',
    });
  }
  
  return user;
};

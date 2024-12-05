import { AuthenticationError } from 'apollo-server';
import { verifyToken } from '../../validation/validation';
import { countUsers, findAllUsers } from '../../user/user.db.datasource';

export const usersQuery = async (skip: number | undefined, limit: number | undefined, token: string | undefined) => {
  if (!token) {
    throw new AuthenticationError('Token is required for this operation!', {
      http_status: '400',
      field: 'authorization',
      reason: 'A valid token must be provided.',
    });
  }

  verifyToken(token);

  const totalUsers = await countUsers();
  if (!limit) {
    limit = 10;
  }

  const users = await findAllUsers(skip, limit);

  const maxPage = Math.round(totalUsers / limit);

  const page = skip ? Math.ceil(skip / limit) : 1;

  return {
    users,
    totalUsers,
    page,
    maxPage,
  };
};

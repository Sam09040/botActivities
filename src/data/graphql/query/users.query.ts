import { AuthenticationError } from 'apollo-server';
import { dbClient } from '../../db/client';
import { verifyToken } from '../../validation/validation';

export const usersQuery = async (skip: number | undefined, limit: number | undefined, token: string | undefined) => {
  if (!token) {
    throw new AuthenticationError('Token is required for this operation!', {
      http_status: '400',
      field: 'authorization',
      reason: 'A valid token must be provided.',
    });
  }

  verifyToken(token);

  const totalUsers = await dbClient.user.count();
  if (!limit) {
    limit = 10;
  }

  const users = await dbClient.user.findMany({
    skip,
    take: limit,
    orderBy: {
      name: 'asc',
    },
  });

  const maxPage = Math.round(totalUsers / limit);

  const page = skip ? Math.ceil(skip / limit) : 1;

  return {
    users,
    totalUsers,
    page,
    maxPage,
  };
};

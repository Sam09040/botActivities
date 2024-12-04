import { AuthenticationError } from 'apollo-server';
import { verifyToken } from '../../../core/security/validation/validation';
import { countUsers, findAllUsers, updateUserAddress } from '../../../data/user/user.db.datasource';
import { getAddresses } from '../../../data/address/address.db.datasource';

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

  const addresses = await getAddresses();
  for (const address of addresses) {
    await updateUserAddress(address);
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

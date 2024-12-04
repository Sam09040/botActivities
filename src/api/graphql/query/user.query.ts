import { AuthenticationError } from 'apollo-server';
import { CustomError } from '../../../core/errors/CustomError';
import 'dotenv/config';
import { findUserById, updateUserAddress } from '../../../data/user/user.db.datasource';
import { verifyToken } from '../../../core/security/validation/validation';
import { getAddresses } from '../../../data/address/address.db.datasource';

export const userQuery = async (id: number, token: string | undefined) => {
  if (!token) {
    throw new AuthenticationError('Token is required for this operation!', {
      http_status: '400',
      field: 'authorization',
      reason: 'A valid token must be provided.',
    });
  }

  verifyToken(token);

  const dbUser = await findUserById(id);
  if (dbUser === null) {
    throw new CustomError('404', 'User not found!', {
      field: 'id',
      reason: 'The provided id does not exist.',
    });
  }

  const addresses = await getAddresses(id);
  for (const address of addresses) {
    await updateUserAddress(address);
  }

  const user = await findUserById(id);

  return user;
};

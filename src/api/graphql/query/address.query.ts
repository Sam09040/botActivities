import { Address } from '@prisma/client';
import { CustomError } from '../../../core/errors/CustomError';
import { getAddresses } from '../../../data/address/address.db.datasource';
import { findUserById } from '../../../data/user/user.db.datasource';

export const addressQuery = async (userId: number): Promise<Address[]> => {
  if (!userId) {
    throw new CustomError('401', 'No user provided', {
      field: 'userId',
      reason: 'A user ID is required to fetch the address.',
    });
  }

  const user = await findUserById(userId);

  if (!user) {
    throw new CustomError('404', 'User not found', {
      field: 'userId',
      reason: 'The provided user ID does not exist.',
    });
  }

  const addresses = await getAddresses(userId);
  return addresses;
};

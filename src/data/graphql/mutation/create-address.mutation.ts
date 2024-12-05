import { createAddress } from '../../address/address.db.datasource';
import { CustomError } from '../../errors/CustomError';
import { Address } from '../../interfaces';
import { findUserById } from '../../user/user.db.datasource';

export const createAddressMutation = async (userId: number, address: Address) => {
  if (!userId) {
    throw new CustomError('401', 'No user provided', {
      field: 'userId',
      reason: 'A user ID is required to create an address.',
    });
  }

  const { cep, street, streetNumber, complement, neighborhood, city, state } = address;

  const user = await findUserById(userId);

  if (!user) {
    throw new CustomError('404', 'User not found!', {
      field: 'userId',
      reason: 'The user you provided does not exist.',
    });
  }

  if (!cep || !street || !streetNumber || !neighborhood || !city || !state) {
    throw new CustomError('400', 'Invalid input!', {
      field: 'data',
      reason: 'All fields are required!',
    });
  }

  const newAddress = await createAddress(user.id, address);

  return {
    userId: newAddress.userId,
    id: newAddress.id,
    cep,
    street,
    streetNumber,
    complement,
    neighborhood,
    city,
    state,
  };
};

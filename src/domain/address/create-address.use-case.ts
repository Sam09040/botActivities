import { InvalidDataError, NotFoundError } from '@core/error';
import { AddressDbDataSource } from '@data/address';
import { UserDbDataSource } from '@data/user';
import { AddressInputModel, AddressModel } from '@domain/model';

const addressDatasource = new AddressDbDataSource();
const userDatasource = new UserDbDataSource();

export async function createAddressUseCase(input: AddressInputModel): Promise<AddressModel> {
  if (!input.data.userId) {
    throw new InvalidDataError('No user provided', {
      field: 'userId',
      reason: 'A user ID is required to create an address',
    });
  }
  const user = await userDatasource.findOneById(input.data.userId);
  if (!user) {
    throw new NotFoundError('User not found!', {
      field: 'userId',
      reason: 'The user you provided does not exist.',
    });
  }

  const { cep, street, streetNumber, neighborhood, city, state } = input.data;

  if (!cep || !street || !streetNumber || !neighborhood || !city || !state) {
    throw new InvalidDataError('Invalid input!', {
      field: 'data',
      reason: 'All fields are required! (Except complement)',
    });
  }

  const address = await addressDatasource.insert(input);
  return address;
}

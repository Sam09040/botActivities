import { NotFoundError } from '@core/error';
import { AddressDbDataSource } from '@data/address';
import { UserDbDataSource } from '@data/user';
import { AddressInputModel, AddressModel } from '@domain/model';

const addressDatasource = new AddressDbDataSource();
const userDatasource = new UserDbDataSource();

export async function createAddressUseCase(input: AddressInputModel): Promise<AddressModel> {
  const user = await userDatasource.findOneById(input.userId);
  if (!user) {
    throw new NotFoundError('User not found!', {
      field: 'userId',
      reason: 'The user you provided does not exist.',
    });
  }

  const address = await addressDatasource.insert(input);
  return address;
}

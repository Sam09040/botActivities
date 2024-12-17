import { InvalidDataError, NotFoundError } from '@core/error';
import { AddressDbDataSource } from '@data/address';
import { UserDbDataSource } from '@data/user';
import { AddressModel } from '@domain/model';

const addressDatasource = new AddressDbDataSource();
const userDatasource = new UserDbDataSource();

export async function addressUseCase(userId: number): Promise<AddressModel[]> {
  const user = await userDatasource.findOneById(userId);

  if (!user) {
    throw new NotFoundError('User not found', {
      field: 'userId',
      reason: 'The user you provided does not exist.',
    });
  }

  return await addressDatasource.findAddresses(user.id);
}

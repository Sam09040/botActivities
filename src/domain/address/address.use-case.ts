import { InvalidDataError, NotFoundError } from '@core/error';
import { AddressDbDataSource } from '@data/address';
import { UserDbDataSource } from '@data/user';
import { AddressModel } from '@domain/model';
import { Service } from 'typedi';

@Service()
export class AddressUseCase {
  constructor(
    private readonly userDatasource: UserDbDataSource,
    private readonly addressDatasource: AddressDbDataSource,
  ) {}

  async exec(userId: number): Promise<AddressModel[]> {
    if (!userId) {
      throw new InvalidDataError('No user provided', {
        field: 'userId',
        reason: 'A user ID is required to fetch the address.',
      });
    }
    const user = await this.userDatasource.findOneById(userId);

    if (!user) {
      throw new NotFoundError('User not found', {
        field: 'userId',
        reason: 'The user you provided does not exist.',
      });
    }

    return await this.addressDatasource.findAddresses(user.id);
  }
}

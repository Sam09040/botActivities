import { NotFoundError } from '@core/error';
import { AddressDbDataSource } from '@data/address';
import { UserDbDataSource } from '@data/user';
import { AddressInputModel, AddressModel } from '@domain/model';
import { Service } from 'typedi';

@Service()
export class CreateAddressUseCase {
  constructor(
    private readonly userDatasource: UserDbDataSource,
    private readonly addressDatasource: AddressDbDataSource,
  ) {}
  async exec(input: AddressInputModel): Promise<AddressModel> {
    const user = await this.userDatasource.findOneById(input.userId);

    if (!user) {
      throw new NotFoundError('User not found!', {
        field: 'userId',
        reason: 'The user you provided does not exist.',
      });
    }

    return this.addressDatasource.insert(input);
  }
}

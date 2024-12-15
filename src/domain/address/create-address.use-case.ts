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
    if (!input.userId) {
      throw new InvalidDataError('No user provided', {
        field: 'userId',
        reason: 'A user ID is required to create an address',
      });
    }
    const user = await this.userDatasource.findOneById(input.userId);
    if (!user) {
      throw new NotFoundError('User not found!', {
        field: 'userId',
        reason: 'The user you provided does not exist.',
      });
    }

    const { cep, street, streetNumber, neighborhood, city, state } = input;

    if (!cep || !street || !streetNumber || !neighborhood || !city || !state) {
      throw new InvalidDataError('Invalid input!', {
        field: 'data',
        reason: 'All fields are required! (Except complement)',
      });
    }

    const address = await this.addressDatasource.insert(input);
    return address;
  }
}

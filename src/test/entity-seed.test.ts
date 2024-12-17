import { BcryptService } from '@core/security/bcrypt';
import { AddressDbDataSource } from '@data/address';
import { UserDbDataSource } from '@data/user';
import { AddressInputModel, AddressModel, UserInputModel, UserModel } from '@domain/model';
const userDatasource = new UserDbDataSource();
const addressDatasource = new AddressDbDataSource();
const bcryptService = new BcryptService();

export async function createUser(): Promise<UserModel> {
  const user: UserInputModel = {
    data: {
      name: 'Sam de Almeida',
      email: 'sam@example.com',
      password: await bcryptService.encrypt('Sam123'),
      birthDate: '09-04-2004',
    },
  };
  return await userDatasource.insert(user);
}

export async function createAddress(userId: number = 1): Promise<AddressModel> {
  const address: AddressInputModel = {
    data: {
      userId,
      cep: '12345-678',
      street: 'R. Existe',
      streetNumber: '123A',
      complement: 'T. Silveira, apt. 512',
      neighborhood: 'Bairro',
      city: 'Cidade',
      state: 'Estado',
    },
  };
  return await addressDatasource.insert(address);
}

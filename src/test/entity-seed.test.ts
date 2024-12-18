import { BcryptService } from '@core/security/bcrypt';
import { AddressDbDataSource } from '@data/address';
import { UserDbDataSource } from '@data/user';
import { AddressInputModel, AddressModel, UserInputModel, UserModel } from '@domain/model';
import Container from 'typedi';
import bcrypt from 'bcrypt';

export async function createUser(): Promise<UserModel> {
  const user: UserInputModel = {
    name: 'Sam de Almeida',
    email: 'sam@example.com',
    password: await Container.get(BcryptService).encrypt('Sam123'),
    birthDate: '09-04-2004',
  };
  return await Container.get(UserDbDataSource).insert(user);
}

export async function createAddress(userId: number = 1): Promise<AddressModel> {
  const address: AddressInputModel = {
    userId,
    cep: '12345-678',
    street: 'R. Existe',
    streetNumber: '123A',
    complement: 'T. Silveira, apt. 512',
    neighborhood: 'Bairro',
    city: 'Cidade',
    state: 'Estado',
  };
  return await Container.get(AddressDbDataSource).insert(address);
}

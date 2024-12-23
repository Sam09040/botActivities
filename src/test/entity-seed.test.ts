import { BcryptService } from '@core/security/bcrypt';
import { AddressDbDataSource } from '@data/address';
import { UserDbDataSource } from '@data/user';
import { AddressInputModel, AddressModel, UserInputModel, UserModel } from '@domain/model';
import { faker } from '@faker-js/faker/.';
import { User } from '@prisma/client';
import { format } from 'date-fns';
import Container from 'typedi';

export async function createUser(user?: UserInputModel): Promise<UserModel> {
  const bcrypt = Container.get(BcryptService);
  const datasource = Container.get(UserDbDataSource);
  if (user) {
    user.password = await bcrypt.encrypt(user.password);
    return await datasource.insert(user);
  }
  user = {
    name: 'Sam de Almeida',
    email: 'sam@example.com',
    password: await bcrypt.encrypt('Sam123'),
    birthDate: '09-04-2004',
  };
  return await datasource.insert(user);
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

export async function createUsers(length: number = 50): Promise<User[]> {
  const users = Array.from({ length }).map(() => {
    const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const emailLastName = lastName.slice(0, 3).toLowerCase();
      const birthDate = format(faker.date.birthdate({ min: 18, max: 80, mode: 'age' }), 'dd-MM-yyyy');

      return {
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}${emailLastName}@example.com`,
        password: faker.internet.password(),
        birthDate,
      };
  });
  return await Container.get(UserDbDataSource).insertMany(users);
}

export async function createAddresses(userIds: number[]) {
  const length = userIds.length;
  const addresses = Array.from({ length }).map(() => {
    return {
      userId: faker.number.int({ min: 2, max: length }),
      cep: faker.location.zipCode('#####-###'),
      street: faker.location.street(),
      streetNumber: faker.location.zipCode('###'),
      complement: 'Apt. ' + faker.number.int({ min: 100, max: 500 }),
      neighborhood: faker.location.county(),
      city: faker.location.city(),
      state: faker.location.state(),
    };
  });
  await Container.get(AddressDbDataSource).insertMany(addresses, userIds);
}

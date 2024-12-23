import { faker } from '@faker-js/faker';
import { format } from 'date-fns';
import { UserDbDataSource } from '@data/user';
import { BcryptService } from '@core/security/bcrypt';
import { Service } from 'typedi';
import { AddressDbDataSource } from '@data/address';

@Service()
export class Seed {
  constructor(
    private readonly bcryptService: BcryptService,
    private readonly userDatasource: UserDbDataSource,
    private readonly addressDatasource: AddressDbDataSource,
  ) {}

  async seedDb(length: number = 50): Promise<void> {
    const user = await this.userDatasource.findOneByEmail('sam@example.com');
    if (!user) {
      const password = await this.bcryptService.encrypt('Sam123');
      await this.userDatasource.insert({
        name: 'Sam de Almeida',
        email: 'sam@example.com',
        password,
        birthDate: '09-04-2004',
      });
    }
    await this.addressDatasource.insert({
      userId: 1,
      cep: '12345-678',
      street: 'R. Existe',
      streetNumber: '123A',
      complement: 'T. Silveira, apt. 512',
      neighborhood: 'Bairro',
      city: 'Cidade',
      state: 'Estado',
    });

    const usersData = Array.from({ length }).map(() => {
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

    const users = await this.userDatasource.insertMany(usersData);
    const ids: number[] = [];
    users.forEach((user) => {
      ids.push(user.id);
    });
    const addresses = Array.from({ length }).map((_: unknown, index: number) => {
      return {
        id: index + 2,
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

    await this.addressDatasource.insertMany(addresses, ids);
  }
}

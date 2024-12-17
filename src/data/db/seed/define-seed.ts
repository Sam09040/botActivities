import { faker } from '@faker-js/faker';
import { format } from 'date-fns';
import { getSeedClient } from './seed-client';
import { UserDbDataSource } from '@data/user';
import { BcryptService } from '@core/security/bcrypt';
import { Service } from 'typedi';

@Service()
export class Seed {
  constructor(
    private readonly bcryptService: BcryptService,
    private readonly datasource: UserDbDataSource,
  ) {}

  async seedDb(length: number = 50) {
    const seed = await getSeedClient();
    const user = await this.datasource.findOneByEmail('sam@example.com');
    if (!user) {
      const id = 1;
      const password = await this.bcryptService.encrypt('Sam123');
      await seed.user([
        {
          id,
          name: 'Sam de Almeida',
          email: 'sam@example.com',
          password,
          birthDate: '09-04-2004',
        },
      ]);
    }
    await seed.address([
      {
        id: 1,
        userId: 1,
        cep: '12345-678',
        street: 'R. Existe',
        streetNumber: '123A',
        complement: 'T. Silveira, apt. 512',
        neighborhood: 'Bairro',
        city: 'Cidade',
        state: 'Estado',
      },
    ]);

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

    for (const user of users) {
      await seed.user([
        {
          name: user.name,
          email: user.email,
          password: user.password,
          birthDate: user.birthDate,
        },
      ]);
    }
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

    for (const address of addresses) {
      await seed.address([
        {
          id: address.id,
          userId: address.userId,
          cep: address.cep,
          street: address.street,
          streetNumber: address.streetNumber,
          complement: address.complement,
          neighborhood: address.neighborhood,
          city: address.city,
          state: address.state,
        },
      ]);
    }
  }
}

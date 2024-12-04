import { User } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { format } from 'date-fns';
import { getSeedClient } from './seed-client';
import { resetDatabase } from './reset-database';
import { encryptPassword } from '../../src/core/security/password';
import { findUserByEmail, updateUserAddress } from '../../src/data/user/user.db.datasource';
import { getAddresses } from '../../src/data/address/address.db.datasource';

export const seedDb = async (length?: number) => {
  const existingUser: User | null = await findUserByEmail('sam@example.com');
  const existingAddresses = await getAddresses(existingUser?.id);

  const seed = await getSeedClient();
  await resetDatabase(seed);

  if (existingUser) {
    const { id, name, email, birthDate } = existingUser;
    const password = await encryptPassword(existingUser.password);
    await seed.user((x) =>
      x(1, {
        id,
        name,
        email,
        password,
        birthDate,
      }),
    );
    existingAddresses.forEach(async (address) => {
      const { id, userId, cep, street, streetNumber, complement, neighborhood, city, state } = address;
      await seed.address((x) =>
        x(1, {
          id,
          userId,
          cep,
          street,
          streetNumber,
          complement,
          neighborhood,
          city,
          state,
        }),
      );
      await updateUserAddress(address);
    });
  } else {
    const id = 1;
    const name = 'Sam de Almeida';
    const email = 'sam@example.com';
    const password = await encryptPassword('Sam123');
    const birthDate = '09-04-2004';
    await seed.user((x) =>
      x(1, {
        id,
        name,
        email,
        password,
        birthDate,
      }),
    );

    const address = {
      id,
      userId: id,
      cep: '12345-678',
      street: 'R. Existe',
      streetNumber: '123A',
      complement: 'T. Silveira, apt. 512',
      neighborhood: 'Bairro',
      city: 'Cidade',
      state: 'Estado',
    };
    const { userId, cep, street, streetNumber, complement, neighborhood, city, state } = address;
    await seed.address((x) =>
      x(1, {
        id,
        userId,
        cep,
        street,
        streetNumber,
        complement,
        neighborhood,
        city,
        state,
      }),
    );
    await updateUserAddress(address);
  }

  if (!length) {
    length = 50;
  }

  const users = Array.from({ length }).map(() => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const emailLastName = lastName.slice(0, 3).toLowerCase();
    const email = `${firstName.toLowerCase()}${emailLastName}@example.com`;
    const password = faker.internet.password();
    const birthDate = format(faker.date.birthdate({ min: 18, max: 80, mode: 'age' }), 'dd-MM-yyyy');

    return {
      name: `${firstName} ${lastName}`,
      email,
      password,
      birthDate,
    };
  });

  for (const user of users) {
    await seed.user((x) =>
      x(1, {
        name: () => user.name,
        email: () => user.email,
        password: () => user.password,
        birthDate: () => user.birthDate,
      }),
    );
  }
  let counter = 1;
  const addresses = Array.from({ length }).map(() => {
    counter++;
    const userId = faker.number.int({ min: 2, max: 51 });
    const cep = faker.location.zipCode('#####-###');
    const street = faker.location.street();
    const streetNumber = faker.location.zipCode('###');
    const complement = 'Apt. ' + faker.number.int({ min: 100, max: 500 });
    const neighborhood = faker.location.county();
    const city = faker.location.city();
    const state = faker.location.state();
    return {
      id: counter,
      userId,
      cep,
      street,
      streetNumber,
      complement,
      neighborhood,
      city,
      state,
    };
  });

  for (const address of addresses) {
    await seed.address((x) =>
      x(1, {
        id: address.id,
        userId: address.userId,
        cep: address.cep,
        street: address.street,
        streetNumber: address.streetNumber,
        complement: address.complement,
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
      }),
    );

    await updateUserAddress(address);
  }
};

export default seedDb;

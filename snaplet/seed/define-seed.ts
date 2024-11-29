
import { User } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { format } from 'date-fns';
import { getSeedClient } from './seed-client';
import { resetDatabase } from './reset-database';
import { encryptPassword } from '../../src/data/graphql/password';
import { findUserById } from '../../src/data/user/user.db.datasource';

export const seedUsers = async (length?: number) => {
    let existingUser: User | null;
    existingUser = await findUserById(1);

    const seed = await getSeedClient();
    await resetDatabase(seed);
    
    if (existingUser) {
        const { id, name, email, birthDate } = existingUser;
        const password = await encryptPassword(existingUser.password);
        await seed.user((x) => x(1, {
            id,
            name,
            email,
            password,
            birthDate,
        }));
    }

    !length ? length = 50 : length

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

    for(const user of users) {
        await seed.user((x) => x(1, {
            name: () => user.name,
            email: () => user.email,
            password: () => user.password,
            birthDate: () => user.birthDate,
        }));
    };
};

export default seedUsers;

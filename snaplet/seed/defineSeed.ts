import { createSeedClient } from '@snaplet/seed'
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { format } from 'date-fns';


export const seedUsers = async () => {
    const prisma = new PrismaClient();
    const existingUser = await prisma.user.findUnique({ where: { id: 1 } });
    
    const seed = await createSeedClient({
        dryRun: false
    });
    
    await seed.$resetDatabase(["! _prisma_migrations", "! public.User"]);
    
    if (existingUser) {
        await seed.user((x) => x(1, {
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email,
            password: existingUser.password,
            birthDate: existingUser.birthDate,
        }));
    }
    const users = Array.from({ length: 50 }).map(() => {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const email = `${firstName.toLowerCase()}@example.com`;
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

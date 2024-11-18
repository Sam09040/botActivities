import { createSeedClient } from '@snaplet/seed'
import { copycat } from '@snaplet/copycat';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const seed = await createSeedClient({
    dryRun: true
});

await seed.$resetDatabase(["! _prisma_migrations", "! public.User"]);

await seed.user((x) => x(3, {
    name: (ctx) => copycat.fullName(ctx.seed),
    email: (ctx) =>
        copycat.email(ctx.seed, {
            domain: 'example.com',
        }),
    password: (ctx) => copycat.password(ctx.seed),
    birthDate: (ctx) => copycat.dateString(ctx.seed, {
        min: '01 January 1970',
        max: '31 December 2006'
    })
}));

process.exit();
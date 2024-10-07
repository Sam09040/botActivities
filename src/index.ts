import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(){
    /* await prisma.user.create({
        data: {
            name: 'Sam',
            email: 'jpalmeida0904@gmail.com',
            username: 'sam0904',
        },
    }) */

    /* await prisma.user.update({
        where: { id: 1 },
        data: {
            email: 'salmeida0904@gmail.com',
        },
    }) */

    const allUsers = await prisma.user.findMany();
    console.log(allUsers);
    
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1);
    })

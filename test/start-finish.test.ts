import server from '../src/app/graphql/server';
import prisma from '../src/app/client/client';
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { UserInput } from '../src/app/interfaces/user';
const port = process.env.PORT;

export const StartFinish = async (user?: UserInput) => {
  before(async () => {
    try {
      const { url } = await server.listen(port);
      console.log(url);
    } catch (error) {
      console.log(error.message);
    }

    try {
      await prisma.$connect();
      console.log('Connected to testdb');
    } catch (error) {
      console.log(error);
    }

    if (user) {
      await prisma.user.create({
        data: {
          name: user.data.name,
          email: user.data.email,
          password: await bcrypt.hash(user.data.password, 10),
          birthDate: user.data.birthDate,
        },
      });
    }
  });

  after(async () => {
    if (server) {
      await server.stop();
      console.log('Server stopped');
    }
    await prisma.user.deleteMany();
    if (prisma) {
      await prisma.$disconnect();
      console.log('Database testdb disconnected');
    }
  });
};

export default StartFinish;

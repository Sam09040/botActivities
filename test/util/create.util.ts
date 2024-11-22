import prisma from '../../src/app/client/client';
import { UserInput } from '../../src/app/interfaces/user';
import bcrypt from 'bcrypt';

export const createUser = async (user: UserInput) => {
  await prisma.user.create({
    data: {
      name: user.data.name,
      email: user.data.email,
      password: await bcrypt.hash(user.data.password, 10),
      birthDate: user.data.birthDate,
    },
  });
};

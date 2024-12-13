import { User } from '@prisma/client';
import { UserInputModel, UserModel } from '@domain/model';
import { dbClient } from '../db/config/db.client';

export class UserDbDataSource {
  insert(input: UserInputModel): Promise<UserModel> {
    return dbClient.user.create({ data: input.data, include: { addresses: true } });
  }

  count() {
    return dbClient.user.count();
  }

  findOneByEmail(email: string) {
    return dbClient.user.findUnique({
      where: { email },
      include: { addresses: true },
    });
  }

  findOneById(id: number) {
    return dbClient.user.findUnique({
      where: { id },
      include: { addresses: true },
    });
  }

  findAll(skip?: number, limit: number = 10): Promise<User[]> {
    return dbClient.user.findMany({
      skip,
      take: limit,
      orderBy: {
        name: 'asc',
      },
      include: {
        addresses: true,
      },
    });
  }

  async deleteAll() {
    return dbClient.user.deleteMany();
  }
}

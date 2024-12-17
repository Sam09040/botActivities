import { NotFoundError } from '@core/error';
import { UserDbDataSource } from '@data/user';

const datasource = new UserDbDataSource();

export async function userUseCase(userId: number) {
  const user = await datasource.findOneById(userId);
  if (!user) {
    throw new NotFoundError('User not found!', {
      field: 'id',
      reason: 'The provided id does not exist.',
    });
  }
  return user;
}

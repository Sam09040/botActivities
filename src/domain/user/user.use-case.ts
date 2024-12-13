import { NotFoundError, UnauthorizedError } from '@core/error';
import { JwtService } from '@core/security/jwt';
import { UserDbDataSource } from '@data/user';
import { UserModel } from '@domain/model';

const datasource = new UserDbDataSource();
const jwtService = new JwtService();

export async function userUseCase(userId: number, token: string | undefined) {
  if (!token) {
    throw new UnauthorizedError('Token is required for this operation!', {
      field: 'authorization',
      reason: 'A valid token must be provided.',
    });
  }

  jwtService.verify(token);

  const user = await datasource.findOneById(userId);
  if (!user) {
    throw new NotFoundError('User not found!', {
      field: 'id',
      reason: 'The provided id does not exist.',
    });
  }
  return user;
}

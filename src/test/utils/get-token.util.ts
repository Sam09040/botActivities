import { JwtService } from '@core/security/jwt';
import { UserModel } from '@domain/model';
import Container from 'typedi';

export const getToken = async (user: UserModel): Promise<string | undefined> => {
  return Container.get(JwtService).sign({ userId: user.id });
};

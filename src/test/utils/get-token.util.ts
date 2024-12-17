import { JwtService } from '@core/security/jwt';
import { JWT_EXPIRATION_TIME, JWT_SECRET } from '@core/security/jwt/jwt.config';
import { UserModel } from '@domain/model';

export const getToken = async (user: UserModel): Promise<string | undefined> => {
  const jwtService = new JwtService(JWT_EXPIRATION_TIME, JWT_SECRET);
  return jwtService.sign({ userId: user.id })
};

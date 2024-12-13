import { decode, JwtPayload, sign, verify } from 'jsonwebtoken';
import { JWT_EXPIRATION_TIME, JWT_SECRET } from './jwt.config';
import { UnauthorizedError } from '@core/error';

export interface JwtToken<T> {
  data: T;
  iat: number;
  exp: number;
}

export class JwtService {
  constructor(
    private readonly tokenExpiration: string = JWT_EXPIRATION_TIME,
    private readonly secret: string = JWT_SECRET,
  ) {}

  public decode(token: string): JwtPayload {
    try {
      return decode(token) as JwtPayload;
    } catch (error) {
      throw new UnauthorizedError('Invalid JWT token', {
        field: 'authorization',
        reason: 'A valid token must be provided.',
      });
    }
  }

  public verify(token: string): JwtPayload {
    try {
      return verify(token, this.secret) as JwtPayload;
    } catch (error) {
      throw new UnauthorizedError('Invalid JWT token', {
        field: 'authorization',
        reason: 'A valid token must be provided.',
      });
    }
  }

  public sign(payload: { userId: number }, extendedExpiration: boolean = false): string {
    const expiresIn = extendedExpiration ? '1w' : this.tokenExpiration;
    return sign({ data: payload }, this.secret, { expiresIn });
  }
}

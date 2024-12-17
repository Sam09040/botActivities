import { decode, sign, verify } from 'jsonwebtoken';
import { JWT_EXPIRATION_TIME, JWT_SECRET } from './jwt.config';
import { UnauthorizedError } from '@core/error';
import { Inject, Service } from 'typedi';

export interface JwtToken<T = any> {
  data: T;
  iat: number;
  exp: number;
}

@Service()
export class JwtService {
  constructor(
    @Inject(JWT_SECRET) private readonly secret: string,
    @Inject(JWT_EXPIRATION_TIME) private readonly tokenExpiration: string
  ) {}

  public decode<T>(token: string): JwtToken<T> {
    try {
      return decode(token) as JwtToken<T>;
    } catch (error) {
      throw new UnauthorizedError('Invalid JWT token', {
        field: 'authorization',
        reason: 'A valid token must be provided.',
      });
    }
  }

  public verify<T>(token: string): JwtToken<T> {
    try {
      return verify(token, this.secret) as JwtToken<T>;
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

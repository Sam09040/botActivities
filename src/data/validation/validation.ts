import jwt from 'jsonwebtoken';
import { AuthenticationError } from 'apollo-server';
import { JWT_SECRET } from './secret';

export const verifyToken = (token: string): jwt.JwtPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
  } catch (error) {
    console.log(error.message);
    throw new AuthenticationError('Token is invalid!', {
      http_status: '401',
      field: 'authorization',
      reason: 'A valid token must be provided.',
    });
  }
};

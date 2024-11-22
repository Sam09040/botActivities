import { AuthenticationError } from 'apollo-server';
import jwt from 'jsonwebtoken';

export const verifyToken = (token: string, JWT_SECRET: string) => {
  try {
    jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new AuthenticationError('Token is invalid!', {
      http_status: '401',
      field: 'authorization',
      reason: 'A valid token must be provided.',
    });
  }
};

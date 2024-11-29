import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './secret';

export const createToken = (rememberMe: boolean, userId: number): string => {
  if (rememberMe) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1w' });
  } else {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
  }
};

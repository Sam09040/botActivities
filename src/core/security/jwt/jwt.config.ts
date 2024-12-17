import 'dotenv/config';
import Container, { Token } from 'typedi';
export const JWT_SECRET = new Token<string>('JWT_SECRET');
export const JWT_EXPIRATION_TIME = new Token<string>('JWT_EXPIRATION_TIME');
Container.set(JWT_SECRET, process.env.JWT_SECRET);
Container.set(JWT_EXPIRATION_TIME, process.env.JWT_EXPIRATION_TIME);

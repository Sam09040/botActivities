import Container, { Token } from 'typedi';
export const PASSWORD_MIN_LENGTH = new Token<number>('PASSWORD_MIN_LENGTH');
Container.set(PASSWORD_MIN_LENGTH, process.env.PASSWORD_MIN_LENGTH);

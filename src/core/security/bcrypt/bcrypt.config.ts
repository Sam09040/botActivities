import Container, { Token } from 'typedi';
export const SALT = new Token<number>('SALT');
Container.set(SALT, Number(process.env.SALT));

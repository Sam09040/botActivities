import bcrypt from 'bcrypt';
import { SALT } from './bcrypt.config';

export class BcryptService {
  constructor(private salt: number = SALT) {}

  encrypt(password: string): Promise<string> {
    return bcrypt.hash(password, this.salt);
  }

  compare(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}

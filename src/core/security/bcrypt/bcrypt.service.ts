import bcrypt from 'bcrypt';
import { SALT } from './bcrypt.config';
import { Inject, Service } from 'typedi';

@Service()
export class BcryptService {
  constructor(@Inject(SALT) private salt: number) {}

  encrypt(password: string): Promise<string> {
    return bcrypt.hash(password, this.salt);
  }

  compare(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}

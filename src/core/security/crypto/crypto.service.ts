import * as crypto from 'node:crypto';
import { Inject, Service } from 'typedi';
import { PASSWORD_MIN_LENGTH } from './crypto.config';

@Service()
export class CryptoService {
  constructor(@Inject(PASSWORD_MIN_LENGTH) private minLength: number) {}

  generateRandomPassword(length: number = this.minLength): string {
    return crypto.randomBytes(length / 2).toString('hex');
  }
}

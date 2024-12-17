import { PASSWORD_MIN_LENGTH } from "@core/security/crypto";
import Container, { Inject, Service } from "typedi";

@Service()
export class ValidatePasswordUseCase {
  constructor(@Inject(PASSWORD_MIN_LENGTH) private readonly minLength: number){}
  
  hasDigit(value?: string): boolean {
    return value?.search(/\d/) !== -1;
  }
  
  hasLetter(value?: string): boolean {
    return value?.search(/[a-zA-Z]/) !== -1;
  }
  
  hasValidLength(value?: string): boolean {
    const length = value?.length ?? 0;
    return length >= this.minLength;
  }
  
  exec(value?: string): string | null {
    if (!this.hasValidLength(value)) {
      return 'password must be at least ' + this.minLength;
    }
  
    if (!this.hasDigit(value)) {
      return 'password must have a number';
    }
  
    if (!this.hasLetter(value)) {
      return 'password must have a letter';
    }
  
    return null;
  }
} 

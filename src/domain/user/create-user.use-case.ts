import { InvalidDataError } from '@core/error';
import { BcryptService } from '@core/security/bcrypt';
import { UserDbDataSource } from '@data/user';
import { UserInputModel, UserModel } from '@domain/model';
import { ValidatePasswordUseCase } from './validate-password.use-case';
import { Service } from 'typedi';

@Service()
export class CreateUserUseCase {
  constructor(
    private readonly bcryptService: BcryptService,
    private readonly jwtService: JwtService,
    private readonly datasource: UserDbDataSource,
    private readonly validatePasswordUseCase: ValidatePasswordUseCase
  ) {}

  async exec (input: UserInputModel, token: string | undefined): Promise<UserModel> {
   if (!token) {
     throw new UnauthorizedError('Token is required for this operation!', {
       field: 'authorization',
       reason: 'A valid token must be provided.',
     });
   }
 
   this.jwtService.verify(token);
   const { name, email, password, birthDate } = input;
   if (!name || !email || !password || !birthDate) {
     throw new InvalidDataError('Invalid input!', {
       field: 'data',
       reason: 'All fields are required!',
     });
   }
 
   const existingEmail = await this.datasource.findOneByEmail(email);
 
   if (existingEmail) {
     throw new InvalidDataError('Email already exists!', {
       field: 'email',
       reason: 'The email you provided is already in use. Please choose a different email address.',
     });
   }
 
   const isValid = this.validatePasswordUseCase.exec(password);
   if (isValid !== null) {
     throw new InvalidDataError(isValid, {
       field: 'password',
       reason: 'Password must be at least 6 characters long, have a least one letter and one digit!',
     });
   }
 
   const newUser = {
     name,
     email,
     password: await this.bcryptService.encrypt(password),
     birthDate,
   };
 
   return this.datasource.insert(newUser);
 }
}

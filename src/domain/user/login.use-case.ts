import { NotFoundError, UnauthorizedError } from '@core/error';
import { BcryptService } from '@core/security/bcrypt';
import { JwtService } from '@core/security/jwt';
import { UserDbDataSource } from '@data/user';
import { LoginInputModel, LoginModel } from '@domain/model';
import { Service } from 'typedi';

@Service()
export class LoginUseCase {
  constructor(
    private readonly bcryptService: BcryptService,
    private readonly jwtService: JwtService,
    private readonly datasource: UserDbDataSource
  ){}

  async exec (input: LoginInputModel): Promise<LoginModel> {
    const { email, password, rememberMe } = input;
    if (!email || !password) {
      throw new InvalidDataError('Invalid email or password', {
        field: 'email or password',
        reason: 'You must provide a valid email and password',
      });
    }
  
    const user = await this.datasource.findOneByEmail(email);
  
    if (!user) {
      throw new NotFoundError('User not found', {
        field: 'data',
        reason: 'User not found',
      });
    }
  
    const isPasswordValid = user && (await this.bcryptService.compare(password, user.password));
  
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials', {
        field: 'credentials',
        reason: 'The credentials are invalid.',
      });
    }
  
    return {
      token: this.jwtService.sign({ userId: user.id }, rememberMe),
      user,
    };
  }
}

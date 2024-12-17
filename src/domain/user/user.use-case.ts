import { NotFoundError } from '@core/error';
import { UserDbDataSource } from '@data/user';
import { UserModel } from '@domain/model';
import { Service } from 'typedi';

@Service()
export class UserUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly datasource: UserDbDataSource
  ) {}

  async exec (userId: number, token: string | undefined): Promise<UserModel> {
    if (!token) {
      throw new UnauthorizedError('Token is required for this operation!', {
        field: 'authorization',
        reason: 'A valid token must be provided.',
      });
    }
  
    this.jwtService.verify(token);
  
    const user = await this.datasource.findOneById(userId);
    if (!user) {
      throw new NotFoundError('User not found!', {
        field: 'id',
        reason: 'The provided id does not exist.',
      });
    }
    return user;
  }
}

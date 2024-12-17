import { buildPageInfo, PageInputModel } from '@core/pagination';
import { UserDbDataSource } from '@data/user';
import { Service } from 'typedi';

@Service()
export class UsersUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly datasource: UserDbDataSource,
  ) {}

  async exec (input: PageInputModel, token: string | undefined) {
    let { skip, limit } = input;
    if (!token) {
      throw new UnauthorizedError('Token is required for this operation!', {
        field: 'authorization',
        reason: 'A valid token must be provided.',
      });
    }

    this.jwtService.verify(token);

    const totalUsers = await this.datasource.count();
    const pageInfo = buildPageInfo(input, totalUsers);
    skip = pageInfo.skip;
    limit = pageInfo.limit;
    const { page, maxPage } = pageInfo;
    return {
      users: await this.datasource.findAll(skip, limit),
      page,
      maxPage,
    };
  }
}

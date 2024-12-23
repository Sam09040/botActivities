import { buildPageInfo, PageInputModel } from '@core/pagination';
import { UserDbDataSource } from '@data/user';
import { UsersModel } from '@domain/model';
import { Service } from 'typedi';

@Service()
export class UsersUseCase {
  constructor(private readonly datasource: UserDbDataSource) {}

  async exec(input: PageInputModel): Promise<UsersModel> {
    let { skip, limit } = input;

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

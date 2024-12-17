import { PageInfoModel } from '@core/pagination';
import { Field, Int, ObjectType } from 'type-graphql';

@ObjectType()
export class PageInfo implements Partial<PageInfoModel> {
  @Field(() => Int, { description: 'Page number' })
  page: number;

  @Field(() => Int, { description: 'Max number of pages' })
  maxPage: number;
}

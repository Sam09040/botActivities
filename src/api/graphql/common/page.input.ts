import { PageInputModel } from '@core/pagination';
import { Min } from 'class-validator';
import { Field, InputType, Int, ObjectType } from 'type-graphql';

@InputType()
export class PageInput implements PageInputModel {
  @Field(() => Int, { description: 'Number of elements to skip', defaultValue: 0 })
  @Min(0, { message: 'Invalid data' })
  skip?: number;

  @Field(() => Int, { description: 'Number of elements to get', defaultValue: 0 })
  @Min(0, { message: 'Invalid data' })
  limit: number;
}

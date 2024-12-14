import { dbClient } from '../db/config/db.client';
import { AddressInputModel, AddressModel } from '@domain/model';

export class AddressDbDataSource {
  insert(input: AddressInputModel): Promise<AddressModel> {
    return dbClient.address.create({ data: input });
  }

  findAddresses(userId?: number) {
    return dbClient.address.findMany({ where: { userId } });
  }
}

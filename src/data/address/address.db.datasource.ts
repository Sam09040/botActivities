import { Service } from 'typedi';
import { dbClient } from '../db/config/db.client';
import { AddressInputModel, AddressModel } from '@domain/model';

@Service()
export class AddressDbDataSource {
  insert(input: AddressInputModel): Promise<AddressModel> {
    return dbClient.address.create({ data: input });
  }

  findAddresses(userId?: number) {
    return dbClient.address.findMany({ where: { userId } });
  }

  async insertMany({ addressInput, userId }: { addressInput: AddressInputModel[]; userId: number[] }): Promise<AddressModel[]> {
    const data = addressInput.map((address: AddressInputModel, index: number) => ({
      ...address,
      userId: userId?.[index],
    }));

    return dbClient.address.createManyAndReturn({ data });
  }
}

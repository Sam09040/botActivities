import fs from 'node:fs';
import FormData from 'form-data';
import Container from 'typedi';
import { checkError, requestMaker } from '@test';
import { connectDb, connectServer, disconnectDb, disconnectServer } from '@test/utils';
import { expect } from 'chai';
import { UserDbDataSource } from '@data/user';
import { isDefined } from '@test/utils/is-defined';

describe.only('UserResolver - CreateManyUsers', () => {
  const query = { query: 'mutation UploadCsv($file: Upload!) {uploadCsv(file: $file)}' };
  const formData = new FormData();
  const datasource = Container.get(UserDbDataSource);
  before('before', async () => {
    await connectDb();
    await connectServer();
  });

  after('after', async () => {
    await disconnectServer();
    await disconnectDb();
  });

  it.only('should create a single user', async () => {
    const file = fs.createReadStream('./src/test/csv/single-user.csv', 'utf-8');
    formData.append('operations', JSON.stringify(query));
    formData.append('map', JSON.stringify({ 0: ['variables.file'] }));
    formData.append('0', file);
    const response = await requestMaker<any, any>({ formData });
    expect(response.data.data).to.equal('Upload ended successfully! Check the database to see the uploaded info.');
    const user = await datasource.findAll();
    isDefined(user);
  });

  it('should create multiple users', async () => {
    const file = fs.createReadStream('./src/test/csv/single-user.csv', 'utf-8');
    formData.append('operations', JSON.stringify(query));
    formData.append('map', JSON.stringify({ 0: ['variables.file'] }));
    formData.append('0', file);
    const response = await requestMaker<any, any>({ formData });
    expect(response.data.data).to.equal('Upload ended successfully! Check the database to see the uploaded info.');
    const user = await datasource.findAll();
    isDefined(user);
    expect(user.length).to.equal(3);
  });

  it('should return an error for invalid fields', async () => {
    const file = fs.createReadStream('./src/test/csv/missing-input.csv', 'utf-8');
    formData.append('operations', JSON.stringify(query));
    formData.append('map', JSON.stringify({ 0: ['variables.file'] }));
    formData.append('0', file);
    const response = await requestMaker<any, any>({ formData });
    checkError(response, 400, 'Invalid or missing fields on the file!', {
      field: 'file',
      reason: 'There are invalid or missing fields on the provided file',
    });
  });

  it('should return an error for empty fields', async () => {
    const file = fs.createReadStream('./src/test/csv/empty.csv', 'utf-8');
    formData.append('operations', JSON.stringify(query));
    formData.append('map', JSON.stringify({ 0: ['variables.file'] }));
    formData.append('0', file);
    const response = await requestMaker<any, any>({ formData });
    checkError(response, 400, 'The file must contain at least one user info', {
      field: 'file',
      reason: 'Not enough information',
    });
  });

  it('should return an error for existing users', async () => {
    const file = fs.createReadStream('./src/test/csv/missing-input.csv', 'utf-8');
    formData.append('operations', JSON.stringify(query));
    formData.append('map', JSON.stringify({ 0: ['variables.file'] }));
    formData.append('0', file);
    const response = await requestMaker<any, any>({ formData });
    checkError(response, 400, 'One or more users already exist', {
      field: 'data',
      reason: 'One or more emails already in use',
    });
  });
});

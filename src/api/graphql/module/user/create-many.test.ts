import 'reflect-metadata';
import fs from 'node:fs';
import FormData from 'form-data';
import Container from 'typedi';
import sinon from 'sinon';
import { checkError, checkUser, createUser, requestMaker } from '@test';
import { connectDb, connectServer, disconnectDb, disconnectServer } from '@test/utils';
import { expect } from 'chai';
import { UserDbDataSource } from '@data/user';
import { isDefined } from '@test/utils/is-defined';
import { describe, beforeAll, afterAll, afterEach, it } from '@jest/globals';
import { EmailService } from '@core/email';
import { CryptoService } from '@core/security/crypto';

describe('UserResolver - CreateManyUsers', () => {
  const query = { query: 'mutation UploadCsv($file: Upload!) {uploadCsv(file: $file)}' };
  const formData = new FormData();
  const datasource = Container.get(UserDbDataSource);
  let emailServiceStub: sinon.SinonStub;
  let generatePasswordStub: sinon.SinonStub;
  const files = {
    singleUser: fs.createReadStream('./src/test/csv/single-user.csv', 'utf-8'),
    multipleUsers: fs.createReadStream('./src/test/csv/multiple-users.csv', 'utf-8'),
    noUser: fs.createReadStream('./src/test/csv/empty.csv', 'utf-8'),
    wrongData: fs.createReadStream('./src/test/csv/missing-input.csv', 'utf-8'),
  };
  const tests = {
    singleUserTest: {
      name: 'nix',
      email: 'nix@example.com',
      birthDate: '09-04-2003',
    },
    multipleUsersTest: [
      {
        name: 'Chloe Schmitz',
        email: 'chloesch@example.com',
        birthDate: '21-10-2002',
      },
      {
        name: 'Ryan Peyton',
        email: 'ryanpey@example.com',
        birthDate: '05-02-1998',
      },
      {
        name: 'Trish Connors',
        email: 'trishcon@example.com',
        birthDate: '23-12-2006',
      },
    ],
  };

  beforeAll(async () => {
    await connectDb();
    await connectServer();
  });

  beforeEach(() => {
    emailServiceStub = sinon.stub(EmailService.prototype, 'sendEmail');
    generatePasswordStub = sinon.stub(CryptoService.prototype, 'generateRandomPassword');
  });

  afterEach(async () => {
    sinon.restore();
    await datasource.deleteAll();
  });

  afterAll(async () => {
    await disconnectServer();
    await disconnectDb();
  });

  it('should create a single user', async () => {
    emailServiceStub.resolves();
    generatePasswordStub.returns('password123');

    formData.append('operations', JSON.stringify(query));
    formData.append('map', JSON.stringify({ 0: ['variables.file'] }));
    formData.append('0', files.singleUser);

    const response = await requestMaker<{ uploadCsv: string; }, undefined>({ formData });
    const user = await datasource.findAll();

    expect(response.data.data?.uploadCsv).to.equal(
      'Upload ended successfully! Check the database to see the uploaded info.',
    );
    isDefined(user);
    checkUser(tests.singleUserTest, user[0]);
    expect(emailServiceStub.calledOnce).to.be.true;
    expect(emailServiceStub.firstCall.args).to.deep.equal([
      user[0].name,
      user[0].email,
      'password123',
    ]);
  });

  it('should create multiple users', async () => {
    emailServiceStub.resolves();
    generatePasswordStub.returns('password123');

    formData.append('operations', JSON.stringify(query));
    formData.append('map', JSON.stringify({ 0: ['variables.file'] }));
    formData.append('0', files.multipleUsers);

    const response = await requestMaker<{ uploadCsv: string; }, undefined>({ formData });
    const users = await datasource.findAll();

    expect(response.data.data?.uploadCsv).to.equal(
      'Upload ended successfully! Check the database to see the uploaded info.',
    );
    isDefined(users);
    expect(users.length).to.equal(3);
    users.forEach((user, i) => checkUser(tests.multipleUsersTest[i], user));
  });

  it('should return an error for invalid fields', async () => {
    emailServiceStub.resolves();
    formData.append('operations', JSON.stringify(query));
    formData.append('map', JSON.stringify({ 0: ['variables.file'] }));
    formData.append('0', files.wrongData);
    const response = await requestMaker({ formData });
    checkError(response, 400, 'Invalid or missing fields on the file!', {
      field: 'file',
      reason: 'There are invalid or missing fields on the provided file',
    });
  });

  it('should return an error for empty fields', async () => {
    emailServiceStub.resolves();
    formData.append('operations', JSON.stringify(query));
    formData.append('map', JSON.stringify({ 0: ['variables.file'] }));
    formData.append('0', files.noUser);

    const response = await requestMaker({ formData });

    checkError(response, 400, 'The file must contain at least one user info', {
      field: 'file',
      reason: 'Not enough information',
    });
  });

  it('should return an error for existing users', async () => {
    emailServiceStub.resolves();
    generatePasswordStub.returns('password123');
    const user = {
      name: 'nix',
      email: 'nix@example.com',
      birthDate: '09-04-2003',
      password: 'Nix123',
    };
    await createUser(user);
    formData.append('operations', JSON.stringify(query));
    formData.append('map', JSON.stringify({ 0: ['variables.file'] }));
    formData.append('0', files.singleUser);

    const response = await requestMaker({ formData });

    checkError(response, 400, 'One or more users already exist', {
      field: 'data',
      reason: 'One or more emails already in use',
    });
  });
});

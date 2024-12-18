import { CsvInputValidation } from '@core/csv/csv.input';
import { CsvService } from '@core/csv/csv.service';
import { EmailService } from '@core/email';
import { InvalidDataError } from '@core/error';
import { BcryptService } from '@core/security/bcrypt';
import { CryptoService } from '@core/security/crypto';
import { AddressDbDataSource } from '@data/address';
import { UserDbDataSource } from '@data/user';
import { AddressInputModel, CsvInputModel, UserInputModel } from '@domain/model';
import { validate } from 'class-validator';
import { FileUpload } from 'graphql-upload-ts';
import path from 'path';
import { Service } from 'typedi';

@Service()
export class CreateManyUseCase {
  constructor(
    private readonly csvService: CsvService,
    private readonly userDbDatasource: UserDbDataSource,
    private readonly addressDbDatasource: AddressDbDataSource,
    private readonly emailService: EmailService,
    private readonly bcryptService: BcryptService,
    private readonly cryptoService: CryptoService,
  ) {}

  async exec(file: FileUpload) {
    const { filename } = file;

    const extension = path.extname(filename);

    if (extension != '.txt' && extension != '.csv') {
      throw new InvalidDataError('The file extension must be .txt or .csv', {
        field: 'file',
        reason: 'Invalid file extension',
      });
    }

    const csvData = await this.csvService.validate(file);

    if (csvData.length === 0) {
      throw new InvalidDataError('The file must contain at least one user info', {
        field: 'file',
        reason: 'Not enough information',
      });
    }

    const emails = csvData.map((user: CsvInputModel) => user.email);
    const userAlreadyExists = await this.userDbDatasource.findManyByEmail(emails);

    if (userAlreadyExists.length > 0) {
      throw new InvalidDataError('One or more users already exist', {
        field: 'data',
        reason: 'One or more emails already in use',
      });
    }

    const errors = await this.validateCsvData(csvData);

    if (errors.length > 0) {
      throw new InvalidDataError('Invalid or missing fields on the file!', {
        field: 'file',
        reason: 'There are invalid or missing fields on the provided file',
      });
    }

    const { csvUsers, csvAddresses, originalPasswords } = this.storeData(csvData);

    for (const user of csvUsers) {
      user.password = await this.bcryptService.encrypt(user.password);
    }

    const newUsers = await this.userDbDatasource.insertMany(csvUsers);
    const usersIds = newUsers.map((user) => user.id);
    await this.addressDbDatasource.insertMany(csvAddresses, usersIds);

    this.sendEmails(csvData, originalPasswords);
  }

  async validateCsvData(csvData: CsvInputModel[]): Promise<unknown[]> {
    const errorConstraints: unknown[] = [];
    const csvInput = new CsvInputValidation();
    for (const [i, user] of csvData.entries()) {
      csvInput.updateData(user);
      const errors = await validate(csvInput, { stopAtFirstError: true });
      if (errors.length > 0) {
        const errorMessages = errors.map((error) => ({
          user: `User: ${i + 1}`,
          property: error.property,
          constraints: error.constraints,
        }));

        errorConstraints.push(...errorMessages);
      }
    }
    return errorConstraints;
  }

  storeData(csvData: CsvInputModel[]) {
    const csvUsers: UserInputModel[] = [];
    const csvAddresses: AddressInputModel[] = [];
    const originalPasswords: string[] = [];

    csvData.forEach((user: CsvInputModel) => {
      const newUser = {
        name: user.name,
        email: user.email,
        password: this.cryptoService.generateRandomPassword(),
        birthDate: user.birthDate,
      };

      const newAddress = {
        cep: user.cep,
        street: user.street,
        streetNumber: user.streetNumber,
        complement: user.complement,
        neighborhood: user.neighborhood,
        city: user.city,
        state: user.state,
        userId: 0,
      };

      csvUsers.push(newUser);
      originalPasswords.push(newUser.password);
      csvAddresses.push(newAddress);
    });
    return { csvUsers, csvAddresses, originalPasswords };
  }

  async sendEmails(csvData: CsvInputModel[], passwords: string[]) {
    for (const [i, user] of csvData.entries()) {
      //await this.emailService.sendEmail(user.name, user.email, passwords[i]);
      console.log(`Email sent to ${user.name} with the new password: ${passwords[i]}`);
    }
  }
}

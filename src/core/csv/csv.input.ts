import { CsvInputModel } from '@domain/model';
import { IsEmail, IsNotEmpty, IsOptional, Length, MaxLength, MinLength } from 'class-validator';

export class CsvInputValidation implements CsvInputModel {
  @IsNotEmpty()
  @MinLength(3, { message: 'The name must be at least 3 characters long' })
  name: string;

  @IsNotEmpty({ message: 'Email must not be empty' })
  @IsEmail(undefined, { message: 'Inform a valid email' })
  email: string;

  @IsNotEmpty({ message: 'The birth date must not be empty and must have the format dd-MM-yyyy' })
  @Length(10, 10, { message: 'The birth date must have 10 characters and must have the format dd-MM-yyyy' })
  birthDate: string;

  @IsNotEmpty({ message: 'Cep must not be empty' })
  @Length(9, 9, { message: 'Cep must be 8 digits long and have the format 00000-000' })
  cep: string;

  @IsNotEmpty({ message: 'Street must not be empty' })
  @MaxLength(255, { message: 'Street can have up to 255 characters' })
  street: string;

  @IsNotEmpty({ message: 'Street number must not be empty' })
  @MaxLength(4, { message: 'Street number can have up to 4 characters' })
  streetNumber: string;

  @IsNotEmpty({ message: 'Neighborhood must not be empty' })
  @MaxLength(255, { message: 'Neighborhood can have up to 255 characters' })
  neighborhood: string;

  @IsOptional()
  @MaxLength(50, { message: 'Complement can have up to 50 characters' })
  complement?: string;

  @IsNotEmpty({ message: 'City must not be empty' })
  @MaxLength(255, { message: 'City can have up to 255 characters' })
  city: string;

  @IsNotEmpty({ message: 'State must not be empty' })
  @MaxLength(255, { message: 'State can have up to 255 characters' })
  state: string;

  constructor(data?: CsvInputValidation) {
    if (data) {
      this.updateData(data);
    }
  }

  updateData(data: CsvInputModel) {
    this.name = data.name;
    this.email = data.email;
    this.birthDate = data.birthDate;
    this.cep = data.cep;
    this.street = data.street;
    this.streetNumber = data.streetNumber;
    this.complement = data.complement;
    this.neighborhood = data.neighborhood;
    this.city = data.city;
    this.state = data.state;
  }
}

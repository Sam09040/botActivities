import { AddressModel } from './address.model';

export interface UserModel {
  id: number;
  name: string;
  email: string;
  birthDate: string;
  addresses: Array<AddressModel>;
}

export interface UserInputModel {
  name: string;
  email: string;
  password: string;
  birthDate: string;
}

export interface LoginModel {
  user: UserModel;
  token: string;
}

export interface LoginInputModel {
  email: string;
  password: string;
  rememberMe: boolean;
}

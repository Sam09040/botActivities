export interface UserModel {
  id: number;
  name: string;
  email: string;
  birthDate: string;
}

export interface UserInputModel {
  data: {
    name: string;
    email: string;
    password: string;
    birthDate: string;
  };
}

export interface LoginModel {
  user: UserModel;
  token: string;
}

export interface LoginInputModel {
  data: {
    email: string;
    password: string;
    rememberMe: boolean;
  };
}

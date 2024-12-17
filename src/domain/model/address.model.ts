export interface AddressModel {
  id: number;
  userId: number;
  cep: string;
  street: string;
  streetNumber: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
}

export interface AddressInputModel {
  userId: number;
  cep: string;
  street: string;
  streetNumber: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
}

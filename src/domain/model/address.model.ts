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
  data: {
    userId: number;
    cep: string;
    street: string;
    streetNumber: string;
    complement?: string | null;
    neighborhood: string;
    city: string;
    state: string;
  };
}

export interface Address {
  cep: string;
  street: string;
  streetNumber: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
}

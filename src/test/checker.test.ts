import { GraphqlResponse } from './request-maker';
import { expect } from 'chai';
import { isDefined } from './utils/is-defined';
import { AdditionalInfo } from '@graphql/graphql-error.formatter';
import { AddressModel, LoginModel, UserModel } from '@domain/model';
import { JwtService } from '@core/security/jwt';
const jwtService = new JwtService();

export function checkError(
  res: GraphqlResponse<any>,
  code: number,
  message: string,
  additionalInfo: AdditionalInfo,
): void {
  expect(res.data.data).to.be.null;
  isDefined(res.data.errors);
  expect(res.data.errors[0].code).to.equal(code);
  expect(res.data.errors[0].message).to.equal(message);
  expect(res.data.errors[0].additionalInfo.field).to.equal(additionalInfo.field);
  expect(res.data.errors[0].additionalInfo.reason).to.equal(additionalInfo.reason);
}

export function checkUser(response: UserModel, user: UserModel) {
  expect(response.name).to.equal(user.name);
  expect(response.email).to.equal(user.email);
  expect(response.birthDate).to.equal(user.birthDate);
}

export function checkAddress(response: AddressModel, address: AddressModel) {
  expect(response).to.be.deep.eq({
    id: address.id.toString(),
    cep: address.cep,
    street: address.street,
    streetNumber: address.streetNumber,
    complement: address.complement,
    neighborhood: address.neighborhood,
    city: address.city,
    state: address.state,
  });
}

export function checkLogin(response: LoginModel, user: UserModel) {
  const decoded = jwtService.verify(response.token);
  const expiration = decoded.iat! + 60 * 60;
  isDefined(decoded);
  expect(decoded.data.userId).to.equal(user.id);
  expect(decoded.iat).to.be.closeTo(expiration, 5000);

  checkUser(response.user, user);
}

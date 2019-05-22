import { Container, Interfaces } from '@pdc/core';
import bcrypt from 'bcrypt';

@Container.provider()
export class CryptoProvider implements Interfaces.ProviderInterface {
  async boot() {
//
  }


  async cryptPassword(plainPassword) {
    const saltRounds = 10;
    return bcrypt.hash(plainPassword, saltRounds);
  }
  async comparePassword(schema, doc, passw) {
    return bcrypt.compare(passw, doc.password);
  }
  async compareForgottenToken(schema, doc, token) {
    return bcrypt.compare(token, doc.forgottenToken);
  }
}

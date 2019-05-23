import { Container, Interfaces } from '@pdc/core';
import bcrypt from 'bcrypt';

@Container.provider()
export class CryptoProvider implements Interfaces.ProviderInterface {
  async boot() {
//
  }


  async cryptPassword(plainPassword): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(plainPassword, saltRounds);
  }
  async comparePassword(schema, doc, passw): Promise<boolean> {
    return bcrypt.compare(passw, doc.password);
  }

  async compareForgottenToken(schema, doc, token): Promise<boolean> {
    return bcrypt.compare(token, doc.forgottenToken);
  }
}

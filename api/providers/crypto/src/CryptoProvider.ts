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

  generateToken(length:number = 12):string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    // eslint-disable-next-line no-plusplus no-increment-decrement
    for (let i = 0; i < Math.abs(length || 32); i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
  }
}

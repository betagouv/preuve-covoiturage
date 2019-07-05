import { Container, Interfaces } from '@ilos/core';
import * as bcrypt from 'bcryptjs';
import { CryptoProviderInterfaceResolver } from './interfaces/CryptoProviderInterface';

@Container.provider({
  identifier: CryptoProviderInterfaceResolver,
})
export class CryptoProvider implements Interfaces.ProviderInterface {
  async boot() {}

  async cryptPassword(plainPassword: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(plainPassword, saltRounds);
  }
  async cryptToken(plainToken: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(plainToken, saltRounds);
  }
  async comparePassword(plainPwd: string, hashedPwd: string): Promise<boolean> {
    return bcrypt.compare(plainPwd, hashedPwd);
  }

  async compareForgottenToken(plainToken: string, hashedToken: string): Promise<boolean> {
    return bcrypt.compare(plainToken, hashedToken);
  }

  generateToken(length: number = 12): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < Math.abs(length || 32); i = i + 1) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
  }
}

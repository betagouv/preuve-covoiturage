import { CryptoJS, bcrypt } from '@/deps.ts';
import { provider, ProviderInterface } from '@/ilos/common/index.ts';

import { CryptoProviderInterfaceResolver } from './interfaces/CryptoProviderInterface.ts';

@provider({
  identifier: CryptoProviderInterfaceResolver,
})
export class CryptoProvider implements ProviderInterface {
  private saltRounds = 10;

  async cryptPassword(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, this.saltRounds);
  }
  async cryptToken(plainToken: string): Promise<string> {
    return bcrypt.hash(plainToken, this.saltRounds);
  }
  async comparePassword(plainPwd: string, hashedPwd: string): Promise<boolean> {
    return bcrypt.compare(plainPwd, hashedPwd);
  }

  async compareToken(plainToken: string, hashedToken: string): Promise<boolean> {
    return bcrypt.compare(plainToken, hashedToken);
  }

  public md5(content: string): string {
    return CryptoJS.MD5(content).toString();
  }

  public generateToken(length = 32): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < Math.abs(length || 32); i = i + 1) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
  }
}

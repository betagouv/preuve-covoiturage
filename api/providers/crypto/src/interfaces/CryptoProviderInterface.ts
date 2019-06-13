import { Interfaces } from '@ilos/core';

export interface CryptoProviderInterface extends Interfaces.ProviderInterface{
  boot();
  cryptPassword(plainPassword): Promise<string>;
  cryptToken(plainToken): Promise<string>;
  comparePassword(oldPwd: string, newPwd: string): Promise<boolean>;
  compareForgottenToken(oldToken: string, newToken: string): Promise<boolean>;
  generateToken(length: number): string;
}

export abstract class CryptoProviderInterfaceResolver implements CryptoProviderInterface{
  async boot() {
    //
  }
  async cryptPassword(plainPassword: string): Promise<string> {
    throw new Error();
  }
  async cryptToken(plainToken: string): Promise<string> {
    throw new Error();
  }
  async comparePassword(oldPwd: string, newPwd: string): Promise<boolean> {
    throw new Error();
  }

  async compareForgottenToken(oldToken: string, newToken: string): Promise<boolean> {
    throw new Error();
  }
  generateToken(length: number = 12): string {
    throw new Error();
  }
}

import { ProviderInterface } from '@ilos/common';

export interface CryptoProviderInterface extends ProviderInterface {
  boot();
  cryptPassword(plainPassword): Promise<string>;
  cryptToken(plainToken): Promise<string>;
  comparePassword(plainPwd: string, hashedPwd: string): Promise<boolean>;
  compareToken(plainToken: string, hashedToken: string): Promise<boolean>;
  generateToken(length: number): string;
}

export abstract class CryptoProviderInterfaceResolver implements CryptoProviderInterface {
  async boot() {
    //
  }
  async cryptPassword(plainPassword: string): Promise<string> {
    throw new Error();
  }
  async cryptToken(plainToken: string): Promise<string> {
    throw new Error();
  }
  async comparePassword(plainPwd: string, hashedPwd: string): Promise<boolean> {
    throw new Error();
  }

  async compareToken(plainToken: string, hashedToken: string): Promise<boolean> {
    throw new Error();
  }
  generateToken(length: number = 32): string {
    throw new Error();
  }
}

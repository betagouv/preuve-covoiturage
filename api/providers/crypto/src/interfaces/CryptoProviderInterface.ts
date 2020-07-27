import { ProviderInterface } from '@ilos/common';

export interface CryptoProviderInterface extends ProviderInterface {
  boot(): Promise<void>;
  md5(content: string): string;
  sha256(content: string): Promise<string>;
  cryptPassword(plainPassword: string): Promise<string>;
  cryptToken(plainToken: string): Promise<string>;
  comparePassword(plainPwd: string, hashedPwd: string): Promise<boolean>;
  compareToken(plainToken: string, hashedToken: string): Promise<boolean>;
  generateToken(length: number): string;
}

export abstract class CryptoProviderInterfaceResolver implements CryptoProviderInterface {
  async boot(): Promise<void> {
    throw new Error('Not implemented');
  }
  md5(content: string): string {
    throw new Error('Not implemented');
  }
  async sha256(content: string): Promise<string> {
    throw new Error('Not implemented');
  }
  async cryptPassword(plainPassword: string): Promise<string> {
    throw new Error('Not implemented');
  }
  async cryptToken(plainToken: string): Promise<string> {
    throw new Error('Not implemented');
  }
  async comparePassword(plainPwd: string, hashedPwd: string): Promise<boolean> {
    throw new Error('Not implemented');
  }

  async compareToken(plainToken: string, hashedToken: string): Promise<boolean> {
    throw new Error('Not implemented');
  }
  generateToken(length = 32): string {
    throw new Error('Not implemented');
  }
}

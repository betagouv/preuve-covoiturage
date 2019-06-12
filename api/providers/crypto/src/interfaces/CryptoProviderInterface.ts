export interface CryptoProviderInterface {
  boot();
  cryptPassword(plainPassword): Promise<string>;
  comparePassword(oldPwd: string, newPwd: string): Promise<boolean>;
  compareForgottenToken(oldToken: string, newToken: string): Promise<boolean>;
  generateToken(length: number): string;
}

export abstract class CryptoProviderInterfaceResolver {
  async boot() {
    //
  }
  async cryptPassword(plainPassword: string): Promise<string> {
    return;
  }
  async comparePassword(oldPwd: string, newPwd: string): Promise<boolean> {
    return;
  }

  async compareForgottenToken(oldToken: string, newToken: string): Promise<boolean> {
    return;
  }
  generateToken(length: number = 12): string {
    return;
  }
}

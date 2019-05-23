

export interface CryptoProviderInterface {
  boot();
  cryptPassword(plainPassword): Promise<string>;
  comparePassword(schema, doc, passw): Promise<boolean>;
  compareForgottenToken(schema, doc, token): Promise<boolean>;
  generateToken(length:number):string;
}


export abstract class CryptoProviderInterfaceResolver {
  async boot() {
    //
  }
  async cryptPassword(plainPassword): Promise<string> {
    return;
  }
  async comparePassword(schema, doc, passw): Promise<boolean> {
    return;
  }

  async compareForgottenToken(schema, doc, token): Promise<boolean> {
    return;
  }
  generateToken(length:number = 12): string {
    return;
  }
}


export interface RandomProviderInterface {
  boot();
  generateToken(length:number):string;
}


export abstract class RandomProviderInterfaceResolver {
  async boot() {
    //
  }
  generateToken(length:number = 12):string {
    return;
  }
}

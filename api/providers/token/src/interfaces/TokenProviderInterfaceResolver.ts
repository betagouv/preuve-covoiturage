import { TokenProviderInterface } from './TokenProviderInterface';

export abstract class TokenProviderInterfaceResolver implements TokenProviderInterface {
  async sign(
    payload: string | object | Buffer,
    secretOrPrivateKey: string | object | Buffer,
    options?: object,
  ): Promise<string> {
    throw new Error('Method not implemented.');
  }
  async verify(token: string, secretOrPrivateKey: string | object | Buffer, options?: object): Promise<object> {
    throw new Error('Method not implemented.');
  }
}

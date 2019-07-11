import { TokenProviderInterface } from './TokenProviderInterface';
import { TokenPayloadInterface } from '.';

export abstract class TokenProviderInterfaceResolver implements TokenProviderInterface {
  async sign(
    payload: TokenPayloadInterface,
    secretOrPrivateKey: string | object | Buffer,
    options?: object,
  ): Promise<string> {
    throw new Error('Method not implemented.');
  }
  async verify(
    token: string,
    secretOrPrivateKey: string | object | Buffer,
    options?: object,
  ): Promise<TokenPayloadInterface> {
    throw new Error('Method not implemented.');
  }
}

import * as jwt from 'jsonwebtoken';
import { ProviderInterface } from '@ilos/common';

import { TokenPayloadInterface } from '.';

export interface TokenProviderInterface extends ProviderInterface {
  sign(payload: TokenPayloadInterface, options?: jwt.SignOptions): Promise<string>;
  verify(token: string, options?: jwt.VerifyOptions): Promise<TokenPayloadInterface | string>;
}

export abstract class TokenProviderInterfaceResolver implements TokenProviderInterface {
  async sign(payload: TokenPayloadInterface, options?: object): Promise<string> {
    throw new Error('Method not implemented.');
  }
  async verify(token: string, options?: object): Promise<TokenPayloadInterface> {
    throw new Error('Method not implemented.');
  }
}

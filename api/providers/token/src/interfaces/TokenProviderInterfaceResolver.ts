import * as jwt from 'jsonwebtoken';
import { ProviderInterface } from '@ilos/common';

import { TokenPayloadInterface } from '.';
import { TokenProviderConfig } from './TokenProviderConfig';
import { TokenProvider } from '../TokenProvider';

export interface TokenProviderInterface extends ProviderInterface {
  init(cnf?: TokenProviderConfig): TokenProvider;
  sign(payload: TokenPayloadInterface, options?: jwt.SignOptions): Promise<string>;
  verify(token: string, options?: jwt.VerifyOptions): Promise<TokenPayloadInterface | string>;
}

export abstract class TokenProviderInterfaceResolver implements TokenProviderInterface {
  init(cnf?: TokenProviderConfig): TokenProvider {
    throw new Error('Method not implemented');
  }
  async sign(payload: TokenPayloadInterface, options?: object): Promise<string> {
    throw new Error('Method not implemented');
  }
  async verify(token: string, options?: object): Promise<TokenPayloadInterface> {
    throw new Error('Method not implemented');
  }
}

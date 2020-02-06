import * as jwt from 'jsonwebtoken';
import { ProviderInterface } from '@ilos/common';

export interface TokenProviderInterface extends ProviderInterface {
  sign<T extends string | Buffer | object>(payload: T, options?: jwt.SignOptions): Promise<string>;
  verify(token: string, options?: jwt.VerifyOptions): Promise<object>;
}

export abstract class TokenProviderInterfaceResolver implements TokenProviderInterface {
  async sign<T extends string | Buffer | object>(payload: T, options?: jwt.SignOptions): Promise<string> {
    throw new Error('Method not implemented');
  }
  async verify(token: string, options?: jwt.VerifyOptions): Promise<object> {
    throw new Error('Method not implemented');
  }
}

import * as jwt from 'jsonwebtoken';
import { ProviderInterface } from '@ilos/common';

export interface TokenProviderInterface extends ProviderInterface {
  sign<T extends string | Buffer | object>(payload: T, options?: jwt.SignOptions): Promise<string>;
  verify<T extends string | object>(token: string, options?: jwt.VerifyOptions): Promise<T>;
}

export abstract class TokenProviderInterfaceResolver implements TokenProviderInterface {
  async sign<T extends string | Buffer | object>(payload: T, options?: jwt.SignOptions): Promise<string> {
    throw new Error('Method not implemented');
  }
  async verify<T extends string | object>(token: string, options?: jwt.VerifyOptions): Promise<T> {
    throw new Error('Method not implemented');
  }
}

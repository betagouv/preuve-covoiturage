import * as jwt from 'jsonwebtoken';
import { Interfaces } from '@ilos/core';

export interface TokenProviderInterface extends Interfaces.ProviderInterface {
  sign(payload: object | Buffer | string, options?: jwt.SignOptions): Promise<string>;
  verify(token: string, options?: jwt.VerifyOptions): Promise<object | string>;
}

import * as jwt from 'jsonwebtoken';
import { Interfaces } from '@ilos/core';

import { TokenPayloadInterface } from './TokenPayloadInterface';

export interface TokenProviderInterface extends Interfaces.ProviderInterface {
  sign(payload: TokenPayloadInterface, options?: jwt.SignOptions): Promise<string>;
  verify(token: string, options?: jwt.VerifyOptions): Promise<TokenPayloadInterface | string>;
}

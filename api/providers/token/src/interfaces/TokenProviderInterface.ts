import * as jwt from 'jsonwebtoken';
import { ProviderInterface } from '@ilos/common';

import { TokenPayloadInterface } from './TokenPayloadInterface';

export interface TokenProviderInterface extends ProviderInterface {
  sign(payload: TokenPayloadInterface, options?: jwt.SignOptions): Promise<string>;
  verify(token: string, options?: jwt.VerifyOptions): Promise<TokenPayloadInterface | string>;
}

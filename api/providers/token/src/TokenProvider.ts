import * as jwt from 'jsonwebtoken';
import { provider, ProviderInterface } from '@ilos/common';

import { TokenProviderInterfaceResolver, TokenProviderInterface, TokenPayloadInterface } from './interfaces';

@provider({
  identifier: TokenProviderInterfaceResolver,
})
export class TokenProvider implements ProviderInterface, TokenProviderInterface {
  private secret: string | Buffer;
  private ttl: number;
  private signOptions: jwt.SignOptions = {};
  private verifyOptions: jwt.VerifyOptions = {};
  private defaultHeaders: jwt.JwtHeader = {
    alg: 'HS256',
  };

  constructor() {
    // TODO use an external config here
    const config = {
      secret: process.env.APP_JWT_SECRET || 'not-secret',
      ttl: parseInt(process.env.APP_JWT_TTL, 10) || 86400,
      signOptions: {},
      verifyOptions: {},
    };

    this.secret = config.secret;
    this.ttl = config.ttl;
    this.signOptions = {
      algorithm: this.defaultHeaders.alg,
      encoding: 'utf8',
      ...config.signOptions,
    };
    this.verifyOptions = { ...config.verifyOptions };
  }

  async sign(payload: TokenPayloadInterface, options: jwt.SignOptions = {}): Promise<string> {
    return jwt.sign(payload, this.secret, { ...this.signOptions, ...options });
  }

  async verify(token: string, options: jwt.VerifyOptions = {}): Promise<TokenPayloadInterface> {
    const decoded = <TokenPayloadInterface>await jwt.verify(token, this.secret, { ...this.verifyOptions, ...options });

    if (this.ttl > -1 && typeof decoded === 'object' && 'iat' in decoded) {
      // tslint:disable-next-line: no-bitwise
      const expired = ((new Date().getTime() / 1000) | 0) - parseInt((decoded as any).iat, 10) > this.ttl;
      if (expired) throw new jwt.JsonWebTokenError('Expired token');
    }

    return decoded;
  }
}

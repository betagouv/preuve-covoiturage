import * as jwt from 'jsonwebtoken';
import { Container, Interfaces } from '@ilos/core';

import { TokenProviderInterfaceResolver, TokenProviderInterface, TokenPayloadInterface } from './interfaces';
import { TokenProviderConfig } from './interfaces/TokenProviderConfig';

@Container.provider({
  identifier: TokenProviderInterfaceResolver,
})
export class TokenProvider implements Interfaces.ProviderInterface, TokenProviderInterface {
  private secret: string | Buffer;
  private ttl: number;
  private signOptions: jwt.SignOptions = {};
  private verifyOptions: jwt.VerifyOptions = {};
  private defaultHeaders: jwt.JwtHeader = {
    alg: 'HS256',
  };

  constructor(config: TokenProviderConfig) {
    if (!config.secret) {
      throw new Error('JWT secret must be passed in the config');
    }

    this.secret = config.secret;
    this.ttl = config.ttl || 86400;
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

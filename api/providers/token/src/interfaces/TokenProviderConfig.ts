import { SignOptions, VerifyOptions } from 'jsonwebtoken';

export interface TokenProviderConfig {
  secret: string | Buffer;
  ttl?: number;
  alg?: string;
  signOptions?: SignOptions;
  verifyOptions?: VerifyOptions;
}

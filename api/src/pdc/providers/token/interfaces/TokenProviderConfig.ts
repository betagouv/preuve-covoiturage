import type { SignOptions, VerifyOptions } from "dep:jsonwebtoken";

export interface TokenProviderConfig {
  secret?: string | Buffer;
  ttl?: number;
  alg?: string;
  signOptions?: SignOptions;
  verifyOptions?: VerifyOptions;
}

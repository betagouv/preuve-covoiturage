import { jwt } from "@/deps.ts";

export interface TokenProviderConfig {
  secret?: string | Buffer;
  ttl?: number;
  alg?: string;
  signOptions?: jwt.SignOptions;
  verifyOptions?: jwt.VerifyOptions;
}

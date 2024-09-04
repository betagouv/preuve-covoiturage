import { jwt } from "@/deps.ts";
import {
  ConfigInterfaceResolver,
  InitHookInterface,
  provider,
  ProviderInterface,
} from "@/ilos/common/index.ts";

import {
  TokenProviderInterface,
  TokenProviderInterfaceResolver,
} from "./interfaces/index.ts";

@provider({
  identifier: TokenProviderInterfaceResolver,
})
export class TokenProvider
  implements ProviderInterface, TokenProviderInterface, InitHookInterface {
  private secret: string | Buffer;
  private ttl: number;
  private signOptions: jwt.SignOptions = {};
  private verifyOptions: jwt.VerifyOptions = {};

  constructor(private config: ConfigInterfaceResolver) {}

  async init(): Promise<void> {
    this.secret = this.config.get("jwt.secret");
    this.ttl = this.config.get("jwt.ttl");
    this.signOptions = {
      algorithm: this.config.get("jwt.alg"),
      encoding: "utf8",
      ...this.config.get("jwt.signOptions"),
    };
    this.verifyOptions = { ...this.config.get("jwt.verifyOptions") };
  }

  async sign<T extends string | Buffer | object>(
    payload: T,
    options: jwt.SignOptions = {},
  ): Promise<string> {
    return jwt.sign(payload, this.secret, { ...this.signOptions, ...options });
  }

  async verify<T extends string | object>(
    token: string,
    options: jwt.VerifyOptions = {},
  ): Promise<T> {
    const decoded = jwt.verify(token, this.secret, {
      ...this.verifyOptions,
      ...options,
    }) as T;

    // override config TTL when ignoreExpiration option is passed
    const ttl = "ignoreExpiration" in options && options.ignoreExpiration
      ? -1
      : this.ttl;

    if (ttl > -1 && typeof decoded === "object" && "iat" in decoded) {
      const expired = ((new Date().getTime() / 1000) | 0) -
          parseInt((decoded as any).iat, 10) > this.ttl;
      if (expired) throw new jwt.JsonWebTokenError("Expired token");
    }

    return decoded;
  }
}

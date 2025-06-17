import { ProviderInterface } from "@/ilos/common/index.ts";
import { Buffer } from "dep:buffer";
import type { SignOptions, VerifyOptions } from "dep:jsonwebtoken";

export interface TokenProviderInterface extends ProviderInterface {
  sign<T extends string | Buffer | object>(
    payload: T,
    options?: SignOptions,
  ): Promise<string>;
  verify<T extends string | object>(
    token: string,
    options?: VerifyOptions,
  ): Promise<T>;
}

/**
 * @deprecated replace by DexOIDCProvider
 */
export abstract class TokenProviderInterfaceResolver implements TokenProviderInterface {
  async sign<T extends string | Buffer | object>(
    payload: T,
    options?: SignOptions,
  ): Promise<string> {
    throw new Error("Method not implemented");
  }
  async verify<T extends string | object>(
    token: string,
    options?: VerifyOptions,
  ): Promise<T> {
    throw new Error("Method not implemented");
  }
}

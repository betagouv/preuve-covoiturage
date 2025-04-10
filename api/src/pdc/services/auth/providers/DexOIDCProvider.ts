import {
  ConfigInterfaceResolver,
  ForbiddenException,
  InitHookInterface,
  provider,
  UnauthorizedException,
} from "@/ilos/common/index.ts";
import { TokenProvider } from "@/pdc/providers/token/index.ts";
import { TokenPayloadInterface } from "@/pdc/services/application/contracts/common/interfaces/TokenPayloadInterface.ts";
import { ApplicationPgRepositoryProvider } from "@/pdc/services/application/providers/ApplicationPgRepositoryProvider.ts";
import { encodeBase64 } from "dep:encoding";
import { createRemoteJWKSet, jwtVerify } from "dep:jose";

@provider()
export class DexOIDCProvider implements InitHookInterface {
  protected JWKS: ReturnType<typeof createRemoteJWKSet> | undefined;

  constructor(
    protected config: ConfigInterfaceResolver,
    // TODO : clean me after migration
    protected oldApplicationProvider: ApplicationPgRepositoryProvider,
    protected oldTokenProvider: TokenProvider,
  ) {}

  async init(): Promise<void> {
    this.getJWKS();
  }

  protected getJWKS() {
    if (this.JWKS) {
      return this.JWKS;
    }
    const authBaseUrl = this.config.get("dex.base_url");
    this.JWKS = createRemoteJWKSet(new URL(`${authBaseUrl}/keys`));
    return this.JWKS;
  }

  /**
   * @deprecated Remove this when all operators use OIDC access tokens
   */
  private async verifyOldToken(token: string) {
    const payload = await this.oldTokenProvider.verify<
      TokenPayloadInterface & {
        app?: string;
        id?: number;
        permissions?: string[];
      }
    >(token, {
      ignoreExpiration: true,
    });
    /**
     * Handle V1 token format conversion
     */
    if ("id" in payload && "app" in payload) {
      payload.v = 1;
      payload.a = payload.app!;
      payload.o = payload.id!;
      payload.s = "operator";
      payload.id = undefined;
      payload.app = undefined;
      payload.permissions = undefined;
    }

    if (!payload.a || !payload.o) {
      throw new ForbiddenException();
    }
    const data = await this.oldApplicationProvider.find(
      { uuid: payload.a, owner_id: payload.o, owner_service: payload.s },
    );
    const app_uuid = data.uuid;
    const owner_id = data.owner_id;
    const matchUuid = app_uuid === payload.a;

    // V1 tokens have a string owner_id. Check is done on UUID only
    const matchOwn = typeof payload.o === "string" ? true : owner_id === payload.o;
    if (!matchUuid || !matchOwn) {
      throw new UnauthorizedException("Unauthorized application");
    }
    return {
      operator_id: data.owner_id,
      role: "application",
      token_id: `deprecated:${data.owner_id}:${data._id}`,
    };
  }

  async verifyToken(token: string) {
    // TODO clean me
    try {
      const oldData = await this.verifyOldToken(token);
      return oldData;
    } catch {
      // noop
    }

    const clientId = this.config.get("dex.client_id");
    const authBaseUrl = this.config.get("dex.base_url");
    const { payload } = await jwtVerify<{ name: string; email: string }>(token, this.getJWKS(), {
      issuer: authBaseUrl,
      audience: clientId,
    });

    const [role, operator_id] = (payload.name || "").split(":");

    return {
      operator_id: parseInt(operator_id),
      role,
      token_id: payload.email,
    };
  }

  async getToken(access_key: string, secret_key: string): Promise<string> {
    const clientId = this.config.get("dex.client_id");
    const clientSecret = this.config.get("dex.client_secret");
    const authBaseUrl = this.config.get("dex.base_url");

    const url = new URL("/token", authBaseUrl);
    const form = new URLSearchParams();

    // DEX calls these "username" and "password"...
    form.set("username", access_key);
    form.set("password", secret_key);
    form.set("grant_type", "password");
    form.set("scope", "openid email profile");

    const response = await fetch(url, {
      body: form.toString(),
      method: "POST",
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${encodeBase64(`${clientId}:${clientSecret}`)}`,
      },
    });

    if (!response.ok) {
      console.error(`[OIDCProvider:getToken] ${response.status} ${response.statusText}`);
      throw new Error(response.statusText);
    }

    const json = await response.json();
    return json.access_token;
  }
}

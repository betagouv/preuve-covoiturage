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
export class OIDCProvider implements InitHookInterface {
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
    const authBaseUrl = this.config.get("oidc.base_url");
    this.JWKS = createRemoteJWKSet(new URL(`${authBaseUrl}/keys`));
    return this.JWKS;
  }

  getLoginUrl() {
    const clientId = this.config.get("oidc.client_id");
    const authBaseUrl = this.config.get("oidc.base_url");
    const redirectUrl = this.config.get("oidc.redirect_url");
    const url = new URL(authBaseUrl);
    url.pathname = "/auth";
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("scope", "openid profile email");
    url.searchParams.set("redirect_uri", redirectUrl);
    url.searchParams.set("response_type", "code");
    return url.toString();
  }

  async getTokenFromCode(code: string) {
    const clientId = this.config.get("oidc.client_id");
    const clientSecret = this.config.get("oidc.client_secret");
    const authBaseUrl = this.config.get("oidc.base_url");
    const redirectUrl = this.config.get("oidc.redirect_url");
    const url = new URL(authBaseUrl);
    url.pathname = "/token";
    const form = new URLSearchParams();
    form.set("grant_type", "authorization_code");
    form.set("client_id", clientId);
    form.set("client_secret", clientSecret);
    form.set("code", code);
    form.set("redirect_uri", redirectUrl);
    const response = await fetch(url, {
      body: form.toString(),
      method: "POST",
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
      },
    });
    const json = await response.json();
    return json.access_token;
  }

  async getUserInfoFromToken(token: string) {
    const authBaseUrl = this.config.get("oidc.base_url");
    const url = new URL(authBaseUrl);
    url.pathname = "/userinfo";
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    const json = await response.json();
    return {
      email: json.email,
      siret: json.preferred_username,
    };
  }

  // TODO clean me after migration
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

    const clientId = this.config.get("oidc.client_id");
    const authBaseUrl = this.config.get("oidc.base_url");
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

  async getToken(username: string, password: string): Promise<string> {
    const clientId = this.config.get("oidc.client_id");
    const clientSecret = this.config.get("oidc.client_secret");
    const authBaseUrl = this.config.get("oidc.base_url");
    const url = new URL(authBaseUrl);
    url.pathname = "/token";
    const form = new URLSearchParams();
    form.set("grant_type", "password");
    form.set("username", username);
    form.set("password", password);
    form.set("scope", "openid email profile");

    console.info(`[OIDCProvider:getToken] ${url.toString()}`);
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

import { encodeBase64, jose } from "@/deps.ts";
import { ConfigInterfaceResolver, InitHookInterface, provider } from "@/ilos/common/index.ts";

@provider()
export class OidcProvider implements InitHookInterface {
  protected JWKS: jose.KeyLike | undefined;
  constructor(protected config: ConfigInterfaceResolver) {}

  async init(): Promise<void> {
    this.getJWKS();
  }

  protected getJWKS() {
    if (this.JWKS) {
      return this.JWKS;
    }
    const authBaseUrl = this.config.get("oidc.base_url");
    this.JWKS = jose.createRemoteJWKSet(new URL(`${authBaseUrl}/keys`));
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

  async verifyToken(token: string) {
    const clientId = this.config.get("oidc.client_id");
    const authBaseUrl = this.config.get("oidc.base_url");
    const { payload } = await jose.jwtVerify<{ name: string; email: string }>(token, this.getJWKS(), {
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
    const clientId = this.config.get("oidc.client_id");
    const clientSecret = this.config.get("oidc.client_secret");
    const authBaseUrl = this.config.get("oidc.base_url");
    const url = new URL(authBaseUrl);
    url.pathname = "/token";
    const form = new URLSearchParams();
    form.set("grant_type", "password");
    form.set("username", access_key);
    form.set("password", secret_key);
    form.set("scope", "openid email profile");
    const response = await fetch(url, {
      body: form.toString(),
      method: "POST",
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${encodeBase64(`${clientId}:${clientSecret}`)}`,
      },
    });
    const json = await response.json();
    return json.access_token;
  }
}

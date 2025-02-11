import { ConfigInterfaceResolver, provider } from "@/ilos/common/index.ts";

@provider()
export class OidcProvider {
  constructor(protected config: ConfigInterfaceResolver) {}

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
}

import { ConfigInterfaceResolver, InitHookInterface, provider } from "@/ilos/common/index.ts";
import { UserRepository } from "@/pdc/services/auth/providers/UserRepository.ts";
import { createRemoteJWKSet } from "dep:jose";
import * as client from "dep:openid-client";

@provider()
export class ProConnectOIDCProvider implements InitHookInterface {
  protected JWKS: ReturnType<typeof createRemoteJWKSet> | undefined;
  protected clientConfig: client.Configuration | undefined;

  constructor(
    protected config: ConfigInterfaceResolver,
    private userRepository: UserRepository,
  ) {}

  async init(): Promise<void> {
    await this.getConfig();
  }

  protected async getConfig() {
    const clientId = this.config.get("proconnect.client_id");
    const clientSecret = this.config.get("proconnect.client_secret");
    const server = this.config.get("proconnect.base_url");
    this.clientConfig = await client.discovery(
      server,
      clientId,
      clientSecret,
    );
  }

  async getLoginUrl() {
    if (!this.clientConfig) {
      await this.getConfig();
    }
    const redirect_uri = this.config.get("proconnect.redirect_url");
    const scope = "openid email siret";

    let state = client.randomState();
    const nonce = client.randomNonce();

    const parameters: Record<string, string> = {
      redirect_uri,
      scope,
      nonce,
      state,
    };

    if (!this.clientConfig!.serverMetadata().supportsPKCE()) {
      state = client.randomState();
      parameters.state = state;
    }

    const redirectUrl: URL = client.buildAuthorizationUrl(this.clientConfig!, parameters);
    return { redirectUrl, state, nonce };
  }

  async getToken(url: URL, expectedNonce: string, expectedState: string) {
    if (!this.clientConfig) {
      await this.getConfig();
    }
    const tokens = await client.authorizationCodeGrant(this.clientConfig!, url, {
      expectedNonce,
      expectedState,
      idTokenExpected: true,
    });
    return tokens;
  }

  async getUserInfo(accessToken: string, sub: string) {
    if (!this.clientConfig) {
      await this.getConfig();
    }
    const userInfo = await client.fetchUserInfo(this.clientConfig!, accessToken, sub);
    return await this.getLocalUser(userInfo.email!, userInfo.siret! as string);
  }

  protected async getLocalUser(email: string, siret: string) {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user || (user.siret !== siret && user.role !== "registry.admin")) {
      return {
        email: email,
        role: "anonymous",
        permissions: [],
      };
    }
    return {
      ...user,
      permissions: this.config.get(`permissions.${user.role}.permissions`, []),
    };
  }

  async getLogoutUrl(idToken: string) {
    if (!this.clientConfig) {
      await this.getConfig();
    }
    const state = client.randomState();
    const redirect = this.config.get("proconnect.logout_redirect_url");
    const redirectUrl = client.buildEndSessionUrl(this.clientConfig!, {
      post_logout_redirect_uri: redirect,
      id_token_hint: idToken,
      state,
    });
    return { state, redirectUrl };
  }
}

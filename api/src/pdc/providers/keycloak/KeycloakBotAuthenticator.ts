import { jose } from "@/deps.ts";
import { provider } from "@/ilos/common/index.ts";
import { env_or_fail } from "@/lib/env/index.ts";
import { logger } from "@/lib/logger/index.ts";
import { IBotCredentials } from "@/pdc/providers/keycloak/IBotCredentials.ts";

@provider()
export class KeycloakBotAuthenticator {
  protected baseUrl: string;
  protected token?: string;
  protected tokenExpiry?: number;
  protected realm: string;
  protected botClient: string;
  protected botClientSecret: string;

  protected JWKS;

  constructor() {
    this.baseUrl = env_or_fail("KC_URL", "http://auth.covoiturage.test");
    this.realm = env_or_fail("KC_REALM", "covoiturage");
    this.botClient = env_or_fail("KC_BOT_CLIENT");
    this.botClientSecret = env_or_fail("KC_BOT_CLIENT_SECRET");
    this.JWKS = jose.createRemoteJWKSet(
      new URL(
        `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/certs`,
      ),
    );
  }

  public async login(
    data: IBotCredentials,
  ): Promise<{ token: string; expires_in: number }> {
    try {
      const url =
        `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/token`;

      const d = new URLSearchParams();
      d.append("client_id", this.botClient);
      d.append("client_secret", this.botClientSecret);
      d.append("grant_type", "password");
      d.append("username", `bot@${data.access_key}`);
      d.append("password", data.secret_key);
      const response = await fetch(
        url,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
            "Accept": "application/json",
          },
          method: "POST",
          body: d,
        },
      );
      const tokens: { access_token: string; expires_in: number } =
        await response.json();
      return { token: tokens.access_token, expires_in: tokens.expires_in };
    } catch (error) {
      logger.error("Error logging in to Keycloak", error);
      throw new Error("Login failed");
    }
  }

  public async verify(
    token: string,
  ): Promise<{ operator_id: number; role: string }> {
    const { payload } = await jose.jwtVerify<
      { operator_id: string; pdc_role: string }
    >(token, this.JWKS);
    return {
      operator_id: parseInt(payload.operator_id, 10),
      role: payload.pdc_role,
    };
  }
}

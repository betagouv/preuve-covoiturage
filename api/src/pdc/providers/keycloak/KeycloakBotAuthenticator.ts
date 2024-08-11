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
  protected adminClient: string;
  protected adminClientSecret: string;

  constructor() {
    this.baseUrl = env_or_fail("KC_URL", "http://auth.covoiturage.test");
    this.realm = env_or_fail("KC_REALM", "covoiturage");
    this.adminClient = env_or_fail("KC_BOT_CLIENT");
    this.adminClientSecret = env_or_fail("KC_BOT_CLIENT_SECRET");
  }

  public async login(
    data: IBotCredentials,
  ): Promise<{ operator_id: number; role: string }> {
    try {
      const response = await fetch(
        `/realms/${this.realm}/protocol/openid-connect/token`,
        {
          headers: {
            "Content-type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            client_id: this.adminClient,
            client_secret: this.adminClientSecret,
            grant_type: "password",
            username: data.access_key,
            password: data.secret_key,
          }),
        },
      );
      logger.log(response);
      return { operator_id: 1, role: "" };
    } catch (error) {
      logger.error("Error logging in to Keycloak", error);
      throw new Error("Login failed");
    }
  }
}

import { KcAdminClient } from "@/deps.ts";
import { provider } from "@/ilos/common/index.ts";
import { env_or_fail } from "@/lib/env/index.ts";
import { logger } from "@/lib/logger/index.ts";
import { randomString, v4 } from "@/lib/uuid/index.ts";
import { IBotCredentials } from "@/pdc/providers/keycloak/IBotCredentials.ts";

interface User {
  //username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  enabled?: boolean;
  attributes?: {
    phone: string;
    pdc_role: string;
    operator_id?: number;
    territory_id?: number;
  };
}

@provider()
export class KeycloakManager {
  protected client: KcAdminClient;
  protected token?: string;
  protected tokenExpiry?: number;
  protected realm?: string;
  protected adminClient: string;
  protected adminClientSecret: string;

  protected botClient: string;

  constructor() {
    this.client = new KcAdminClient({
      baseUrl: env_or_fail("KC_URL", "http://auth.covoiturage.test"),
      realmName: env_or_fail("KC_REALM", "covoiturage"),
    });

    this.adminClient = env_or_fail("KC_ADMIN_CLIENT");
    this.adminClientSecret = env_or_fail("KC_ADMIN_CLIENT_SECRET");
    this.botClient = env_or_fail("KC_BOT_CLIENT");
  }

  private async login(): Promise<void> {
    try {
      await this.client.auth({
        grantType: "client_credentials",
        clientId: this.adminClient,
        clientSecret: this.adminClientSecret,
      });
    } catch (error) {
      logger.error("Error logging in to Keycloak", error);
      throw new Error("Login failed");
    }
  }

  public async listUser(): Promise<any[]> {
    await this.login();
    try {
      const users = await this.client.users.find();
      return users.map((u) => ({
        ...u,
        attributes: {
          phone: u.attributes?.phone?.pop(),
          operator_id: parseInt(u.attributes?.operator_id?.pop() || "0", 10),
          territory_id: parseInt(u.attributes?.territory_id?.pop() || "0", 10),
          pdc_role: u.attributes?.pdc_role?.pop(),
        },
      }));
    } catch (error) {
      logger.error("Error fetching users from Keycloak", error);
      throw new Error("List user failed");
    }
  }

  public async createUser(user: User): Promise<void> {
    await this.login();
    try {
      await this.client.users.create(
        { ...user, enabled: true, username: user.email },
      );
    } catch (error) {
      logger.error("Error creating user in Keycloak", error);
      throw new Error("Create user failed");
    }
  }

  public async createBot(operator_id: number): Promise<IBotCredentials> {
    await this.login();
    const access_key = v4();
    const secret_key = randomString(32);
    const payload = {
      username: `bot@${access_key}`,
      email: `bot@${access_key}`,
      firstName: access_key,
      lastName: operator_id.toString(),
      enabled: true,
      emailVerified: true,
      attributes: {
        operator_id,
        pdc_role: "operator.user",
      },
      credentials: [{
        temporary: false,
        value: secret_key,
        type: "password",
      }],
      clientRoles: {
        [this.botClient]: ["bot"],
      },
      realmRoles: [],
    };

    await this.client.users.create(payload);

    return {
      access_key,
      secret_key,
    };
  }

  public async deleteUser(id: string): Promise<void> {
    await this.login();
    try {
      await this.client.users.del({ id });
    } catch (error) {
      logger.error("Error creating user in Keycloak", error);
      throw new Error("Create user failed");
    }
  }
}

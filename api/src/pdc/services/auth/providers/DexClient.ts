import { ConfigInterfaceResolver, InitHookInterface, NotFoundException, provider } from "@/ilos/common/index.ts";
import { bcrypt_hash } from "@/lib/crypto/index.ts";
import { randomString, v4 } from "@/lib/uuid/index.ts";
import { Dex } from "@/pdc/services/auth/dex/generated/api.ts";
import { getDexClient } from "@/pdc/services/auth/dex/getDexClient.ts";
import { AccessToken } from "@/pdc/services/auth/dto/AccessToken.ts";
import { GrpcClient } from "dep:grpc";

@provider()
export class DexClient implements InitHookInterface {
  protected client: (GrpcClient & Dex) | undefined;
  constructor(protected config: ConfigInterfaceResolver) {}

  async init(): Promise<void> {
    await this.getClient();
  }

  protected async getClient() {
    if (this.client) {
      return this.client;
    }

    const host = this.config.get("dex.grpc_host");
    const port = this.config.get("dex.grpc_port");
    this.client = await getDexClient({
      host,
      port,
    });
    return this.client;
  }

  async listByOperator(id: number): Promise<AccessToken[]> {
    const result = await (await this.getClient()).ListPasswords({});
    if (!result.passwords) {
      return [];
    }
    return result.passwords.map((p) => {
      const [role, operator_id] = p.username?.split(":") || [];
      return {
        token_id: p.email,
        operator_id: parseInt(operator_id),
        role,
      };
    }).filter((p) => p.operator_id === id);
  }

  async createForOperator(operator_id: number, role?: "application") {
    const uuid = v4();
    const password = randomString();
    const hash = new TextEncoder().encode(await bcrypt_hash(password));
    await (await this.getClient()).CreatePassword({
      password: {
        email: uuid,
        username: `${role}:${operator_id}`,
        hash,
        userId: uuid,
      },
    });
    return {
      uuid,
      password,
    };
  }

  async deleteByOperator(operator_id: number, token_id: string) {
    const tokens = await this.listByOperator(operator_id);
    const exists = tokens.find((t) => t.operator_id === operator_id && t.token_id === token_id);
    if (!exists) {
      throw new NotFoundException();
    }
    await (await this.getClient()).DeletePassword({
      email: token_id,
    });
  }
}

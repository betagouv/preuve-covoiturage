import { serviceProvider } from "@/ilos/common/index.ts";
import { RedisConnection } from "@/ilos/connection-redis/index.ts";
import { ServiceProvider as BaseServiceProvider } from "@/ilos/core/index.ts";
import { env_or_fail } from "@/lib/env/index.ts";
import { CustomProvider } from "../Providers/CustomProvider.ts";
import { HelloAction } from "./actions/HelloAction.ts";
import { LogAction } from "./actions/LogAction.ts";
import { ResultAction } from "./actions/ResultAction.ts";

const redisConnection = new RedisConnection(
  env_or_fail("APP_REDIS_URL", "redis://127.0.0.1:6379"),
  { lazyConnect: true },
);

@serviceProvider({
  config: { string: { hello: "Hello world" } },
  providers: [CustomProvider, [RedisConnection, redisConnection]],
  handlers: [HelloAction, ResultAction, LogAction],
  queues: ["string"],
})
export class ServiceProvider extends BaseServiceProvider {
  public connection = redisConnection;

  async init() {
    await super.init();
    this.getContainer().get(CustomProvider).set("string:");
    await this.connection.up();
  }

  async destroy(): Promise<void> {
    await this.connection.down();
  }
}

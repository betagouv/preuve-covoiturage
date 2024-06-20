import { process, Redis, RedisOptions } from "@/deps.ts";
import {
  ConnectionConfigurationType,
  ConnectionInterface,
  DestroyHookInterface,
  InitHookInterface,
} from "@/ilos/common/index.ts";

/**
 * This is a workaround to make `process` available to redisio library.
 * @fixme
 */
type WindowProcess = Window & typeof globalThis & { process: NodeJS.Process };
(window as WindowProcess).process = process;

export class RedisConnection
  implements
    ConnectionInterface<Redis>,
    DestroyHookInterface,
    InitHookInterface {
  protected client: Redis | null = null;

  get connected(): boolean {
    // "wait" | "reconnecting" | "connecting" | "connect" | "ready" | "close" | "end";
    return this.getClient().status === "ready";
  }

  constructor(
    protected readonly config: ConnectionConfigurationType | string,
    protected readonly options: Partial<RedisOptions> = {},
  ) {}

  async init(): Promise<void> {
    await this.up();
  }

  async up() {
    if (!this.connected && this.getClient().status === "wait") {
      await this.getClient().connect();
    }
  }

  async destroy(): Promise<void> {
    await this.down();
  }

  async down() {
    if (this.connected) {
      try {
        await this.getClient().quit();
      } catch (e: any) {
        if (e?.message !== "Connection is closed.") {
          throw e;
        }
      }
    }
  }

  getClient(): Redis {
    if (!this.client) {
      this.client = this.buildClient();
    }
    return this.client;
  }

  protected buildClient(): Redis {
    const defaultConfig = {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      ...this.options,
    };

    if (typeof this.config === "string") {
      return new Redis(this.config, defaultConfig);
    }

    const conn = new Redis({
      ...defaultConfig,
      ...this.config,
    });

    return conn;
  }
}

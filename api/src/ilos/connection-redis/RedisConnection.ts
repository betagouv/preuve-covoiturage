import {
  ConnectionConfigurationType,
  ConnectionInterface,
  DestroyHookInterface,
  InitHookInterface,
} from '/ilos/common/index.ts';
import { Redis } from 'ioredis';
// FIXME
import process from 'node:process'
window.process = process

export class RedisConnection implements ConnectionInterface<Redis>, DestroyHookInterface, InitHookInterface {
  protected client: Redis;
  protected connected = false;

  constructor(protected readonly config: ConnectionConfigurationType | string) {}

  async init(): Promise<void> {
    await this.up();
  }

  async up() {
    if (!this.connected && this.getClient().status === 'wait') {
      await this.getClient().connect();
      this.connected = true;
      return;
    }
  }

  async destroy(): Promise<void> {
    await this.down();
  }

  async down() {
    if (this.connected) {
      this.getClient().disconnect();
      this.connected = false;
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
      // lazyConnect: true,
    };
    if (typeof this.config === 'string') {
      return new Redis(this.config, defaultConfig);
    }
    const conn = new Redis({
      ...defaultConfig,
      ...this.config,
    });
    return conn;
  }
}

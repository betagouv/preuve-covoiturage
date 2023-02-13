import { Redis as RedisInterface } from 'ioredis';
import Redis from 'ioredis';

import { ConnectionInterface, ConnectionConfigurationType } from '@ilos/common';

export class RedisConnection implements ConnectionInterface<RedisInterface> {
  protected client: RedisInterface;
  protected connected = false;

  constructor(protected readonly config: ConnectionConfigurationType | string) {}

  async up() {
    if (!this.connected && this.getClient().status === 'wait') {
      await this.getClient().connect();
      this.connected = true;
      return;
    }
  }

  async down() {
    if (this.connected) {
      this.getClient().disconnect();
      this.connected = false;
    }
  }

  getClient(): RedisInterface {
    if (!this.client) {
      this.client = this.buildClient();
    }
    return this.client;
  }

  protected buildClient(): RedisInterface {
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

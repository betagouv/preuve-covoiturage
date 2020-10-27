// tslint:disable import-name no-duplicate-imports
import { Redis as RedisInterface } from 'ioredis';
import Redis from 'ioredis';

import { ConnectionInterface, ConnectionConfigurationType } from '@ilos/common';

export class RedisConnection implements ConnectionInterface<RedisInterface> {
  protected client: RedisInterface;
  protected connected = false;

  constructor(protected readonly config: ConnectionConfigurationType) {}

  async up() {
    if (!this.connected && this.getClient().status === 'wait') {
      await this.getClient().connect();
      this.connected = true;
      return;
    }
  }

  async down() {
    if (this.connected) {
      await this.getClient().disconnect();
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
    if (this.config.connectionString) {
      const { connectionString, ...other } = this.config;
      return new Redis(connectionString, {
        ...other,
        // lazyConnect: true,
      });
    }
    return new Redis({
      ...this.config,
      // lazyConnect: true,
    });
  }
}

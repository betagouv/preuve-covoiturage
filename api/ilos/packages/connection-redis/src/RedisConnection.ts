// tslint:disable import-name no-duplicate-imports
import { Redis as RedisInterface } from 'ioredis';
import Redis from 'ioredis';

import { ConnectionInterface, ConnectionConfigurationType } from '@ilos/common';

export class RedisConnection implements ConnectionInterface<RedisInterface> {
  protected client: RedisInterface;
  protected connected = false;

  constructor(config: ConnectionConfigurationType) {
    if (config.connectionString) {
      const { connectionString, ...other } = config;
      this.client = new Redis(connectionString, {
        ...other,
        lazyConnect: true,
      });
    } else {
      this.client = new Redis({
        ...config,
        lazyConnect: true,
      });
    }
  }

  async up() {
    if (!this.connected && this.client.status === 'wait') {
      await this.client.connect();
      this.connected = true;
      return;
    }
  }

  async down() {
    if (this.connected) {
      await this.client.disconnect();
      this.connected = false;
    }
  }

  getClient(): RedisInterface {
    return this.client;
  }
}

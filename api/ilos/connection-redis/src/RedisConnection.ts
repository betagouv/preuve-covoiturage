import { Redis as RedisInterface } from 'ioredis';
import { URL } from 'url';
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

    if (this.config.connectionString) {
      const { connectionString, ...other } = this.config;
      const connectionURL = new URL(connectionString);
      return new Redis({
        ...defaultConfig,
        ...other,
        host: connectionURL.hostname,
        port: parseInt(connectionURL.port) || 6379,
        username: connectionURL.username || null,
        password: connectionURL.password || null,
        db: parseInt(connectionURL.pathname.replace(/\//g, '')) || 0,
      });
    }
    return new Redis({
      ...defaultConfig,
      ...this.config,
    });
  }
}

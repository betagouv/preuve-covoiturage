import { MongoClient } from 'mongodb';

import { ConnectionInterface, ConnectionConfigurationType } from '@ilos/common';

export class MongoConnection implements ConnectionInterface<MongoClient> {
  protected client: MongoClient;
  protected connected = false;

  constructor(protected config: ConnectionConfigurationType) {
    const { connectionString, connectionOptions } = this.config;
    const mongoConfig = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ...connectionOptions,
    };

    this.client = new MongoClient(connectionString, mongoConfig);
  }

  async up() {
    if (!this.connected) {
      await this.client.connect();
      this.connected = true;
      return;
    }
  }

  async down() {
    if (this.connected) {
      await this.client.close();
      this.connected = false;
    }
  }

  getClient(): MongoClient {
    return this.client;
  }
}

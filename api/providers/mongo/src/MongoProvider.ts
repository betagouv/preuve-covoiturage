import { MongoClient, Collection, Db } from 'mongodb';
import { Container, Providers, Interfaces } from '@pdc/core';

@Container.provider()
export class MongoProvider implements Interfaces.ProviderInterface {
  protected client: MongoClient;
  protected connected = false;

  constructor(protected config: Providers.ConfigProvider) {}

  async boot() {
    const mongoConfig = {
      useNewUrlParser: true,
      ...this.config.get('mongo.config', {}),
    };

    const mongoUrl = this.config.get('mongo.url');

    this.client = new MongoClient(mongoUrl, mongoConfig);
  }

  protected async ensureConnected() {
    try {
      if (this.connected) {
        return;
      }
      await this.client.connect();
      this.connected = true;
    } catch (err) {
      throw err;
    }
  }

  async getDb(name: string): Promise<Db> {
    await this.ensureConnected();
    return this.client.db(name);
  }

  async getCollectionFromDb(collection: string, db: string): Promise<Collection> {
    await this.ensureConnected();
    return this.client.db(db).collection(collection);
  }

  async close() {
    if (this.connected) {
      await this.client.close();
      this.connected = false;
    }
  }
}

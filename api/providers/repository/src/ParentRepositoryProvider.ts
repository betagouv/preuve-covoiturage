import { MongoProvider, CollectionInterface, MongoException } from '@pdc/provider-mongo';

import { Providers, Types } from '@pdc/core';
import { ParentRepositoryProviderInterface, Model } from './ParentRepositoryProviderInterface';

export abstract class ParentRepositoryProvider implements ParentRepositoryProviderInterface {
  protected collection: CollectionInterface;
  protected validation: Set<string> = new Set();

  constructor(
    protected config: Providers.ConfigProvider,
    protected mongoProvider: MongoProvider,
  ) {
  }

  boot(): void {
    return;
  }

  public getDbName(): string {
    return this.config.get('mongo.db');
  }

  public getKey(): string {
    throw new Error('Key not set');
  }

  public getDatabase(): string {
    throw new Error('Database not set');
  }

  public getModel(): Types.NewableType<any> {
    return Object;
  }

  async getCollection() {
    return this.mongoProvider.getCollectionFromDb(this.getKey(), this.getDbName());
  }

  async find(id: string): Promise<Model> {
    const collection = await this.getCollection();
    const result = await collection.findOne({ _id: id });
    return this.instanciate(result);
  }

  async all(): Promise<Model[]> {
    const collection = await this.getCollection();
    const results = await collection.find().toArray();
    return this.instanciateMany(results);
  }

  async create(data: Model): Promise<Model> {
    const collection = await this.getCollection();
    const { result, ops } = await collection.insertOne(data);
    if (result.ok !== 1) {
      throw new MongoException();
    }
    return this.instanciate(ops[0]);
  }

  async delete(data: Model): Promise<void> {
    const collection = await this.getCollection();
    const { deletedCount } = await collection.deleteOne({ _id: data._id });
    if (deletedCount !== 1) {
      throw new MongoException();
    }
    return;
  }

  async update(data: Model, patch?: any): Promise<Model> {
    const collection = await this.getCollection();
    const selector = { _id: data._id };
    if (patch) {
      const { result } = await collection.updateOne(selector, {
        $set: patch,
      });
      if (result.ok !== 1) {
        throw new MongoException();
      }
      return this.instanciate({ ...data, ...patch });
    }
    const { modifiedCount } = await collection.replaceOne(selector, data);
    if (modifiedCount !== 1) {
      throw new MongoException();
    }
    return data;
  }
  async clear(): Promise<void> {
    const collection = await this.getCollection();
    const { result } = await collection.deleteMany({});
    if (result.ok !== 1) {
      throw new MongoException();
    }
    return;
  }

  protected instanciate(data: any): Model {
    const constructor = this.getModel();
    return new constructor(data);
  }

  protected instanciateMany(data: any[]): Model[] {
    return data.map((d) => this.instanciate(d));
  }
}

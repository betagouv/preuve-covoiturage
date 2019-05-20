import { MongoProvider, CollectionInterface, MongoException, ObjectId } from '@pdc/provider-mongo';
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

  async delete(data: Model | { _id: string }): Promise<void> {
    const collection = await this.getCollection();
    const id = (typeof data._id === 'string') ? new ObjectId(data._id) : data._id;
    const result = await collection.deleteOne({ _id: id });
    if (result.deletedCount !== 1) {
      throw new MongoException();
    }
    return;
  }

  async update(data: Model): Promise<Model> {
    const collection = await this.getCollection();
    const selector = { _id: data._id };
    const { modifiedCount } = await collection.replaceOne(selector, data);
    if (modifiedCount !== 1) {
      throw new MongoException();
    }
    return data;
  }

  async patch(id: ObjectId | string, patch?: any): Promise<Model> {
    const collection = await this.getCollection();
    const normalizedId = (typeof id === 'string') ? new ObjectId(id) : id;
    const result = await collection.findOneAndUpdate(
      { _id: normalizedId },
      {
        $set: patch,
      },
      {
        returnOriginal: false,
      },
    );
    if (result.ok !== 1) {
      throw new MongoException();
    }
    return this.instanciate(result.value);
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
    return data ? new constructor(data) : data;
  }

  protected instanciateMany(data: any[]): Model[] {
    return data.map((d) => this.instanciate(d));
  }
}


// TODO : add index
// TODO : add transformer
// TODO : remove jsonschema
import { MongoProvider, CollectionInterface, MongoException, ObjectId } from '@pdc/provider-mongo';
import { Providers, Types, Exceptions } from '@pdc/core';

import { ParentRepositoryProviderInterface, Model } from './ParentRepositoryProviderInterface';

export abstract class ParentRepositoryProvider implements ParentRepositoryProviderInterface {
  protected readonly castObjectIds: string[] = [
    '_id',
  ];

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

  async getDriver(): Promise<CollectionInterface> {
    return this.getCollection();
  }

  async getCollection() {
    return this.mongoProvider.getCollectionFromDb(this.getKey(), this.getDbName());
  }

  async find(id: string | ObjectId): Promise<Model> {
    const collection = await this.getCollection();
    const normalizedId = (typeof id === 'string') ? new ObjectId(id) : id;
    const result = await collection.findOne({ _id: normalizedId });
    if (!result) throw new Exceptions.NotFoundException('id not found');
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

  async delete(data: Model | string | ObjectId): Promise<void> {
    const collection = await this.getCollection();
    const id = (typeof data === 'string') ? new ObjectId(data) : ('_id' in data) ? data._id : data;
    const result = await collection.deleteOne({ _id: id });
    if (result.deletedCount !== 1) {
      throw new MongoException();
    }
    return;
  }

  async update(data: Model): Promise<Model> {
    const normalizedData = this.castObjectIdFromString(data);
    const collection = await this.getCollection();
    const selector = { _id: normalizedData._id };
    const { modifiedCount } = await collection.replaceOne(selector, normalizedData);
    if (modifiedCount !== 1) {
      throw new MongoException();
    }
    return this.instanciate(data);
  }

  async updateOrCreate(data: Model): Promise<Model> {
    const collection = await this.getCollection();
    const selector = { _id: data._id };
    const { modifiedCount } = await collection.replaceOne(selector, data, { upsert: true });
    if (modifiedCount !== 1) {
      throw new MongoException();
    }
    return data;
  }

  async patch(id: ObjectId | string, patch: any): Promise<Model> {
    const castedPatch = this.castObjectIdFromString(patch);
    const collection = await this.getCollection();
    const normalizedId = (typeof id === 'string') ? new ObjectId(id) : id;
    const result = await collection.findOneAndUpdate(
      { _id: normalizedId },
      {
        $set: castedPatch,
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

    return new constructor(
      this.castStringFromObjectId(data),
    );
  }

  protected instanciateMany(data: any[]): Model[] {
    return data.map((d) => this.instanciate(d));
  }

  protected castObjectIdFromString(data: Model) {
    const castedData = { ...data };
    this.castObjectIds.forEach((path: string) => {
      if (path in castedData) {
        castedData[path] = new ObjectId(castedData[path]);
      }
    });
    return castedData;
  }

  protected castStringFromObjectId(data) {
    const castedData = { ...data };
    this.castObjectIds.forEach((path: string) => {
      if (path in castedData && castedData[path] instanceof ObjectId) {
        castedData[path] = castedData[path].toString();
      }
    });
    return castedData;
  }
}

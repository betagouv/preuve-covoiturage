import { MongoMemoryServer } from 'mongodb-memory-server';
import { bootstrap, Providers } from '@pdc/core';
import { MongoProvider, ObjectId } from '@pdc/provider-mongo';
import { CryptoProvider } from '@pdc/provider-crypto';

import { User } from '../../src/entities/User';

const crypto = new CryptoProvider();

export class FakeMongoServer {
  mongoServer;
  connectionString;
  dbName;
  kernel;
  transport;
  port = '8081';
  collection;
  key;
  request;

  public async startServer(): Promise<any> {
    this.mongoServer = new MongoMemoryServer();
    this.connectionString = await this.mongoServer.getConnectionString();
    this.dbName = await this.mongoServer.getDbName();
    process.env.APP_MONGO_URL = this.connectionString;
    process.env.APP_MONGO_DB = this.dbName;
  }

  public async startTransport(): Promise<any> {
    this.transport = await bootstrap.boot(['', '', 'http', this.port]);
  }

  public async stopServer(): Promise<void> {
    await (<MongoProvider>this.kernel.getContainer().get(MongoProvider)).close();
    await this.mongoServer.stop();
  }

  public async stopTransport(): Promise<void> {
    await this.transport.down();
  }

  public async addUser(user: any): Promise<User> {
    this.kernel = this.transport.getKernel();
    this.key = (<Providers.ConfigProvider>this.kernel.getContainer().get(Providers.ConfigProvider)).get(
      'user.collectionName',
    );
    this.collection = await (<MongoProvider>this.kernel.getContainer().get(MongoProvider)).getCollectionFromDb(
      this.key,
      this.dbName,
    );

    const normalizedUser = { ...user };
    if ('operator' in user) {
      normalizedUser.operator = new ObjectId(user.operator);
    }

    if ('aom' in user) {
      normalizedUser.aom = new ObjectId(user.aom);
    }

    normalizedUser.password = await crypto.cryptPassword(user.password);
    const { result, ops } = await (<Promise<any>>this.collection.insertOne(normalizedUser));

    const newUser = ops[0];
    newUser._id = newUser._id.toString();

    if ('operator' in newUser) newUser.operator = newUser.operator.toString();
    if ('aom' in newUser) newUser.aom = newUser.aom.toString();
    return new User(newUser);
  }

  public async clearCollection(): Promise<void> {
    this.kernel = this.transport.getKernel();
    this.key = (<Providers.ConfigProvider>this.kernel.getContainer().get(Providers.ConfigProvider)).get(
      'user.collectionName',
    );
    this.collection = await (<MongoProvider>this.kernel.getContainer().get(MongoProvider)).getCollectionFromDb(
      this.key,
      this.dbName,
    );
    await this.collection.remove();
  }
}

import { bootstrap } from '@ilos/framework';
import { MongoProvider, ObjectId, CollectionInterface } from '@ilos/provider-mongo';
import { CryptoProvider } from '@pdc/provider-crypto';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';
import { TransportInterface, KernelInterface } from '@ilos/core/dist/interfaces';

import { User } from '../../src/entities/User';
import { MockFactory } from '../mocks/factory';

const crypto = new CryptoProvider();

export class FakeMongoServer {
  dbName: string;
  kernel: KernelInterface;
  transport: TransportInterface;
  port = '8081';
  collection: CollectionInterface;
  key: string;

  public async startServer(): Promise<any> {
    process.env.APP_URL = `http://localhost:${this.port}`;
    process.env.APP_MONGO_DB = 'pdc-test-' + new Date().getTime();
    this.dbName = process.env.APP_MONGO_DB;
  }

  public async startTransport(): Promise<any> {
    this.transport = await bootstrap.boot(['', '', 'http', this.port]);
    this.kernel = this.transport.getKernel();
  }

  public async stopServer(): Promise<void> {
    await (<MongoProvider>this.kernel.getContainer().get(MongoProvider))
      .getDb(process.env.APP_MONGO_DB)
      .then((db) => db.dropDatabase());
  }

  public async stopTransport(): Promise<void> {
    await this.transport.down();
  }

  public async addUser(user: any): Promise<User> {
    if (!('password' in user)) {
      user.password = MockFactory.generatePassword();
    }

    this.kernel = this.transport.getKernel();
    this.key = this.kernel
      .getContainer()
      .get(ConfigProviderInterfaceResolver)
      .get('user.collectionName');
    this.collection = await (<MongoProvider>this.kernel.getContainer().get(MongoProvider)).getCollectionFromDb(
      this.key,
      this.dbName,
    );

    const normalizedUser = { ...user };
    if ('operator' in user) {
      normalizedUser.operator = new ObjectId(user.operator);
    }

    if ('territory' in user) {
      normalizedUser.territory = new ObjectId(user.territory);
    }

    normalizedUser.password = await crypto.cryptPassword(user.password);
    const { ops } = await (<Promise<any>>this.collection.insertOne(normalizedUser));

    const newUser = ops[0];
    newUser._id = newUser._id.toString();

    if ('operator' in newUser) newUser.operator = newUser.operator.toString();
    if ('territory' in newUser) newUser.territory = newUser.territory.toString();

    return new User(newUser);
  }

  public async clearCollection(): Promise<void> {
    this.kernel = this.transport.getKernel();

    this.key = this.kernel
      .getContainer()
      .get(ConfigProviderInterfaceResolver)
      .get('user.collectionName');

    this.collection = await (<MongoProvider>this.kernel.getContainer().get(MongoProvider)).getCollectionFromDb(
      this.key,
      this.dbName,
    );

    await this.collection.drop();
  }
}

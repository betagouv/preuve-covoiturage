import path from 'path';
import { Interfaces } from '@ilos/core';
import { MongoConnection, ObjectId, CollectionInterface } from '@ilos/connection-mongo';
import { CryptoProvider } from '@pdc/provider-crypto';
import { ConfigInterfaceResolver } from '@ilos/config';
import { User } from '../../src/entities/User';
import { MockFactory } from '../mocks/factory';
import { ServiceProvider } from '../../src/ServiceProvider';
import { bootstrap } from '../../src/bootstrap';

const crypto = new CryptoProvider();

export class FakeMongoServer {
  dbName: string;
  kernel: Interfaces.KernelInterface;
  service: Interfaces.ServiceContainerInterface;
  transport: Interfaces.TransportInterface;
  mongo;
  server;
  port = '8088';
  collection: CollectionInterface;

  public async startServer(): Promise<any> {
    process.env.APP_URL = `http://localhost:${this.port}`;
    process.env.APP_MONGO_DB = 'pdc-test-' + new Date().getTime();
    const configDir = process.env.APP_CONFIG_DIR ? process.env.APP_CONFIG_DIR : './config';
    process.env.APP_CONFIG_DIR = path.join('..', 'dist', configDir);
    this.dbName = process.env.APP_MONGO_DB;
  }

  public async startTransport(): Promise<any> {
    this.transport = await bootstrap.boot('http', this.port);
    this.kernel = this.transport.getKernel();
    const children = this.kernel.getContainer().getAll('children');
    console.log(children[0], ServiceProvider, children[0] === ServiceProvider);
    this.service = this.kernel.getContainer().get(ServiceProvider);
    this.mongo = this.service.getContainer().get(MongoConnection).getClient();
    const key = this.kernel
    .getContainer()
    .get(ConfigInterfaceResolver)
    .get('user.collectionName');
    this.collection = this.mongo.db(this.dbName).collection(key);
    this.server = this.transport.getInstance();
  }

  public async stopServer(): Promise<void> {
    await this.mongo.db(process.env.APP_MONGO_DB).dropDatabase();
  }

  public async stopTransport(): Promise<void> {
    await this.transport.down();
  }

  public async addUser(user: any): Promise<User> {
    if (!('password' in user)) {
      user.password = MockFactory.generatePassword();
    }

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
    await this.collection.drop();
  }
}

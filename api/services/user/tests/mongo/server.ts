import { MongoMemoryServer } from 'mongodb-memory-server';
import axios from 'axios';


import { bootstrap, Providers } from '@pdc/core';
import { MongoProvider } from '@pdc/provider-mongo';
import { NewUserInterface } from '../../src/interfaces/UserInterfaces';
import { User } from '../../src/entities/User';


export class FakeMongoServer {
  mongoServer;
  connectionString;
  dbName;
  kernel;
  transport;
  port = '8081';
  collection;
  key;


  public async start(): Promise<any> {
    this.mongoServer = new MongoMemoryServer();
    this.connectionString = await this.mongoServer.getConnectionString();
    this.dbName = await this.mongoServer.getDbName();
    process.env.APP_MONGO_URL = this.connectionString;
    process.env.APP_MONGO_DB = this.dbName;
    this.transport = await bootstrap.boot(['', '', 'http', this.port]);
    this.kernel = this.transport.getKernel();
    this.key = (<Providers.ConfigProvider>this.kernel.getContainer().get(Providers.ConfigProvider)).get('user.collectionName');
    this.collection = await (<MongoProvider>this.kernel.getContainer().get(MongoProvider)).getCollectionFromDb(this.key, this.dbName);
    return axios.create({
      baseURL: `http://127.0.0.1:${this.port}`,
      timeout: 1000,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
  }

  public async stop(): Promise<void> {
    await (<MongoProvider>this.kernel.getContainer().get(MongoProvider)).close();
    await this.transport.down();
    await this.mongoServer.stop();
  }

  public async addUser(user: NewUserInterface): Promise<User> {
    const newUser = await <Promise<any>>this.collection.insertOne(user);
    return new User(newUser);
  }
}

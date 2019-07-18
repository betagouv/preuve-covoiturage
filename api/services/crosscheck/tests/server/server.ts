import path from 'path';
import { CollectionInterface, MongoConnection } from '@ilos/connection-mongo';
import { KernelInterface, ServiceContainerInterface, TransportInterface, ConfigInterfaceResolver } from '@ilos/common';

import { bootstrap } from '../../src/bootstrap';
import { ServiceProvider } from '../../src/ServiceProvider';
import { Trip } from '../../src/entities/Trip';

export class FakeServer {
  dbName: string;
  kernel: KernelInterface;
  service: ServiceContainerInterface;
  transport: TransportInterface;
  mongo;
  server;
  collection: CollectionInterface;
  key: string;

  public async startServer(): Promise<any> {
    // process.env.APP_URL = `http://localhost:${this.port}`;
    process.env.APP_MONGO_DB = 'pdc-test-' + new Date().getTime();
    const configDir = process.env.APP_CONFIG_DIR ? process.env.APP_CONFIG_DIR : './config';
    process.env.APP_CONFIG_DIR = path.join('..', 'dist', configDir);
    this.dbName = process.env.APP_MONGO_DB;
  }

  public async startTransport(): Promise<any> {
    this.transport = await bootstrap.boot('http', 0);
    this.kernel = this.transport.getKernel();
    this.service = this.kernel.getContainer().get(ServiceProvider);
    this.mongo = this.service
      .getContainer()
      .get(MongoConnection)
      .getClient();
    const key = this.kernel
      .getContainer()
      .get(ConfigInterfaceResolver)
      .get('trip.collectionName');
    this.collection = this.mongo.db(this.dbName).collection(key);
    this.server = this.transport.getInstance();
  }

  public async stopServer(): Promise<void> {
    await this.mongo.db(process.env.APP_MONGO_DB).dropDatabase();
  }

  public async stopTransport(): Promise<void> {
    await this.transport.down();
  }

  public async addTrip(trip: any): Promise<Trip> {
    const normalizedTrip = { ...trip };

    // todo: normalize trip

    const { ops } = await (<Promise<any>>this.collection.insertOne(normalizedTrip));

    const newTrip = ops[0];

    newTrip._id = newTrip._id.toString();

    // todo: stringify ids

    return new Trip(newTrip);
  }

  public async clearCollection(): Promise<void> {
    await this.collection.drop();
  }
}

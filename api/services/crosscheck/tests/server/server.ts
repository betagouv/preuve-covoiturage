import { bootstrap } from '@ilos/framework';
import { MongoProvider, ObjectId, CollectionInterface } from '@ilos/provider-mongo';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';
import { KernelInterface } from '@ilos/core/dist/interfaces';


import { TripInterface } from '../../src/interfaces/TripInterface';
import { Trip } from '../../src/entities/trip';

export class FakeServer {
  dbName: string;
  kernel: KernelInterface;
  transport;
  server;
  port = '8088';
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
    this.server = this.transport.getInstance();
  }

  public async stopServer(): Promise<void> {
    await (<MongoProvider>this.kernel.getContainer().get(MongoProvider))
      .getDb(process.env.APP_MONGO_DB)
      .then((db) => db.dropDatabase());
  }

  public async stopTransport(): Promise<void> {
    await this.transport.down();
  }

  public async addTrip(trip: TripInterface): Promise<Trip> {

    this.kernel = this.transport.getKernel();
    this.key = this.kernel
      .getContainer()
      .get(ConfigProviderInterfaceResolver)
      .get('user.collectionName');
    this.collection = await (<MongoProvider>this.kernel.getContainer().get(MongoProvider)).getCollectionFromDb(
      this.key,
      this.dbName,
    );

    const normalizedTrip = { ...trip };

    // todo: normalize trip

    const { ops } = await (<Promise<any>>this.collection.insertOne(normalizedTrip));

    const newTrip = ops[0];

    newTrip._id = newTrip._id.toString();

    // todo: stringify ids

    return new Trip(newTrip);
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

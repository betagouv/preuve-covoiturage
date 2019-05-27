// tslint:disable max-classes-per-file
import { MongoMemoryServer } from 'mongodb-memory-server';
import { expect } from 'chai';
import { ParentMigrateCommand, ParentMigration } from '../src/commands/ParentMigrateCommand';

import { Parents, Providers, Container, Interfaces } from '@pdc/core';
import { MongoProvider } from '@pdc/provider-mongo';

let mongoServer;
let connectionString;
let dbName;
const targetDb = 'test';
const targetCollection = 'mytestcollection';
const collectionName = 'mymigrations';

@Container.provider()
class FakeConfigProvider extends Providers.ConfigProvider {
  protected config: object = {
    //
  };
  async boot() {
    //
  }
  setConfig(config) {
    this.config = config;
  }
}


class Kernel extends Parents.Kernel {
  alias = [
    MongoProvider,
  ];
}

const kernel = new Kernel();

@Container.injectable()
class FirstMigration extends ParentMigration {
  static signature = '20190527.FirstMigration';

  constructor(
    private mongo: MongoProvider,
  ) {
    super();
  }

  async up() {
    const db = await this.mongo.getDb(targetDb);
    await db.createCollection(targetCollection);
  }

  async down() {
    const db = await this.mongo.getDb(targetDb);
    await db.dropCollection(targetCollection);
  }
}

@Container.injectable()
class SecondMigration extends ParentMigration {
  static signature = '20190527.SecondMigration';

  constructor(
    private mongo: MongoProvider,
  ) {
    super();
  }

  async up() {
    const db = await this.mongo.getDb(targetDb);
    const collection = await db.collection(targetCollection);
    await collection.createIndex({ myindex: 1 });
  }

  async down() {
    const db = await this.mongo.getDb(targetDb);
    const collection = await db.collection(targetCollection);
    await (<any>collection.dropIndex)({ myindex: 1 });
  }
}

@Container.command()
class MigrateCommand extends ParentMigrateCommand {
  entity = 'test';
  migrations = [
    FirstMigration,
    SecondMigration,
  ];

  constructor(
    protected kernel: Interfaces.KernelInterfaceResolver,
    protected db: MongoProvider,
    protected config: Providers.ConfigProvider,
  ) {
    super(kernel, db, config);
  }
}

describe('Repository provider: migrate', () => {
  before(async () => {
    mongoServer = new MongoMemoryServer();
    connectionString = await mongoServer.getConnectionString();
    dbName = await mongoServer.getDbName();
    const container = kernel.getContainer();
    container.bind(Providers.ConfigProvider).to(FakeConfigProvider);
    (<FakeConfigProvider>container.get(Providers.ConfigProvider)).setConfig({
      mongo: {
        url: connectionString,
        db: dbName,
      },
      migration: {
        db: dbName,
        collection: collectionName,
      },
    });
    await kernel.boot();
  });

  after(async () => {
    await (<MongoProvider>kernel.getContainer().get(MongoProvider)).close();
    await mongoServer.stop();
  });

  afterEach(async () => {
    const mongo = (<MongoProvider>kernel.getContainer().get(MongoProvider));
    const collection = await mongo.getCollectionFromDb(collectionName, dbName);
    try {
      await collection.drop();
    } catch {
      //
    }
  });

  it('should list available migrations', async () => {
    const command = <MigrateCommand>kernel.getContainer().get(MigrateCommand);
    const result = await command.call({ status: true, rollback: false, reset: false });
    expect(result).to.eq(`${FirstMigration.signature}: pending\n${SecondMigration.signature}: pending\n`);
  });

  it('should do migration', async () => {
    const command = <MigrateCommand>kernel.getContainer().get(MigrateCommand);
    const mongo = (<MongoProvider>kernel.getContainer().get(MongoProvider));
    const db = await mongo.getDb(targetDb);
    const migrationCollection = await mongo.getCollectionFromDb(collectionName, dbName);
    const result = await command.call({ status: false, rollback: false, reset: false });
    expect(result).to.eq(`${FirstMigration.signature}: success\n${SecondMigration.signature}: success\n`);
    const migrations = await migrationCollection.find({}).toArray();
    expect(migrations.length).to.eq(2);
    expect(migrations.map((m) => ({ signature: m._id, success: m.success }))).to.deep.equal([
      {
        signature: FirstMigration.signature,
        success: true,
      },
      {
        signature: SecondMigration.signature,
        success: true,
      },
    ]);
    const collections = await db.listCollections().toArray();
    expect(collections.length).to.eq(1);
    expect(collections.map(c => c.name)).to.deep.eq([
      targetCollection,
    ]);
    const collection = await db.collection(targetCollection);
    const indexes = await collection.indexes();
    expect(
      indexes
        .map(i => Object.keys(i.key))
        .reduce((acc, i) => ([
          ...acc,
          ...i,
        ]), [])
      ).to.deep.eq([
        '_id',
        'myindex',
      ]);
  });

  it('should do rollback', async () => {
    const command = <MigrateCommand>kernel.getContainer().get(MigrateCommand);
    const mongo = (<MongoProvider>kernel.getContainer().get(MongoProvider));
    const db = await mongo.getDb(targetDb);
    const migrationCollection = await mongo.getCollectionFromDb(collectionName, dbName);
    await command.call({ status: false, rollback: false, reset: false });
    const result = await command.call({ status: false, rollback: 1, reset: false });

    expect(result).to.eq(`${SecondMigration.signature}: success\n`);
    
    const migrations = await migrationCollection.find({}).toArray();
    expect(migrations.length).to.eq(1);
    expect(migrations.map((m) => ({ signature: m._id, success: m.success }))).to.deep.equal([
      {
        signature: FirstMigration.signature,
        success: true,
      },
    ]);

    const collections = await db.listCollections().toArray();
    expect(collections.length).to.eq(1);
    expect(collections.map(c => c.name)).to.deep.eq([
      targetCollection,
    ]);
    const collection = await db.collection(targetCollection);
    const indexes = await collection.indexes();
    expect(
      indexes
        .map(i => Object.keys(i.key))
        .reduce((acc, i) => ([
          ...acc,
          ...i,
        ]), [])
      ).to.deep.eq([
        '_id',
      ]);
  });
  it('should do reset', async () => {
    const command = <MigrateCommand>kernel.getContainer().get(MigrateCommand);
    const mongo = (<MongoProvider>kernel.getContainer().get(MongoProvider));
    const db = await mongo.getDb(targetDb);
    const migrationCollection = await mongo.getCollectionFromDb(collectionName, dbName);
    await command.call({ status: false, rollback: false, reset: false });
    const result = await command.call({ status: false, rollback: false, reset: 1 });
    expect(result).to.eq(`${SecondMigration.signature}: success\n${FirstMigration.signature}: success\n`);

    const migrations = await migrationCollection.find({}).toArray();
    expect(migrations.length).to.eq(0);

    const collections = await db.listCollections().toArray();
    expect(collections.length).to.eq(0);
  });
});

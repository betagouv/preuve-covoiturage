import path from 'path';
import { describe } from 'mocha';
import { MongoConnection } from '@ilos/connection-mongo';
import { kernel } from '@ilos/common';

// import { HttpTransport } from '../src/HttpTransport';
import { Kernel } from '../src/Kernel';

/**
 * This test is meant to import all existing journeys (V1) to the new acquisition pipeline (V2)
 *
 * TODO
 * - protect execution against non-local environments
 * - flash the DB with current production journeys
 * -
 */

// @kernel({

// })
// class ThinKernel extends Kernel {}

const krn = new Kernel();
// const app = new HttpTransport(kernel);

let db;

describe('V1 Journeys importer', () => {
  if (process.env.NODE_ENV !== 'local') {
    console.log('V1 Journeys importer runs only on local systems');
    return;
  }

  before(async () => {
    const configDir = process.env.APP_CONFIG_DIR ? process.env.APP_CONFIG_DIR : './config';
    process.env.APP_CONFIG_DIR = path.join('..', 'dist', configDir);

    await krn.bootstrap();
    const mongoClient = new MongoConnection({ connectionString: process.env.APP_MONGO_URL });
    await mongoClient.up();
    db = mongoClient.getClient().db('pdc-local');

    console.log(
      await db
        .collection('safejourneys')
        .find({})
        .count(),
    );

    // console.log(
    //   await krn.handle({
    //     id: 1,
    //     jsonrpc: '2.0',
    //     method: 'operator:list',
    //     params: {
    //       _context: { call: { user: { permissions: ['operator.list'] } } },
    //     },
    //   }),
    // );
  });

  it('reads 1 entry', async () => {});
});

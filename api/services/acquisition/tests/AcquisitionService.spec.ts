// tslint:disable: no-unused-expression
import supertest from 'supertest';
import path from 'path';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { TransportInterface } from '@ilos/common';
import { MongoConnection } from '@ilos/connection-mongo';

import { bootstrap } from '../src/bootstrap';
import { ServiceProvider } from '../src/ServiceProvider';
import { callFactory } from './helpers/callFactory';

import { test2MissingUserAuth } from './mocks/test2MissingUserAuth';
import { test3FailsOnWrongPermissions } from './mocks/test3FailsOnWrongPermissions';
import { test4FailsOnMethodNotFound } from './mocks/test4FailsOnMethodNotFound';
import { test5PassengerOnly } from './mocks/test5PassengerOnly';
import { test6Nobody } from './mocks/test6Nobody';
import { test7DriverOnly } from './mocks/test7DriverOnly';
import { test8StartDateInTheFuture } from './mocks/test8StartDateInTheFuture';
import { test9StartAfterEnd } from './mocks/test9StartAfterEnd';
import { test10MissingStartDate } from './mocks/test10MissingStartDate';
import { test11MissingEndDate } from './mocks/test11MissingEndDate';
import { test12MissingJourneyId } from './mocks/test12MissingJourneyId';
import { test13MissingOperatorJourneyId } from './mocks/test13MissingOperatorJourneyId';
import { test14JourneyTooOld } from './mocks/test14JourneyTooOld';
import { test15ContributionTooLow } from './mocks/test15ContributionTooLow';
import { test16RevenueTooLow } from './mocks/test16RevenueTooLow.';
import { test17SeatsTooLow } from './mocks/test17SeatsTooLow.';
import { test18WrongOperatorClass } from './mocks/test18WrongOperatorClass';
import { test19WrongEmailFormat } from './mocks/test19WrongEmailFormat';
import { test20WrongIncentiveSiret } from './mocks/test20WrongIncentiveSiret';
import { test22WrongIncentiveIndex } from './mocks/test22WrongIncentiveIndex';
import { test23WrongIncentiveAmount } from './mocks/test23WrongIncentiveAmount';
import { test24WrongPaymentAmount } from './mocks/test24WrongPaymentAmount';
import { test25UnsupportedTravelPass } from './mocks/test25UnsupportedTravelPass';
import { test26DuplicateJourneyId } from './mocks/test26DuplicateJourneyId';

chai.use(chaiAsPromised);
const { expect } = chai;

let transport: TransportInterface;
let request: supertest.SuperTest<supertest.Test>;

const user = {
  operator: '5d13c703bb3ed9807cad2745',
  operator_name: 'MaxiCovoit',
  permissions: ['journey.create'],
};

const rpcCall = callFactory(user);

describe('Acquisition service', async () => {
  before(async () => {
    process.env.APP_MONGO_DB = 'pdc-test-' + new Date().getTime();
    const configDir = process.env.APP_CONFIG_DIR ? process.env.APP_CONFIG_DIR : './config';
    process.env.APP_CONFIG_DIR = path.join('..', 'dist', configDir);

    transport = await bootstrap.boot('http', 0);
    request = supertest(transport.getInstance());
  });

  after(async () => {
    await (<MongoConnection>transport
      .getKernel()
      .get(ServiceProvider)
      .get(MongoConnection))
      .getClient()
      .db(process.env.APP_MONGO_DB)
      .dropDatabase();

    await transport.down();
  });

  it('#01 - fails on empty payload', async () => {
    return request
      .post('/')
      .send(rpcCall())
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
      });
  });

  it('#02 - fails on missing user authorization', async () => {
    return request
      .post('/')
      .send(test2MissingUserAuth)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(403);
        expect(response.body).to.have.property('error');
      });
  });

  it('#03 - fails on wrong permissions', async () => {
    return request
      .post('/')
      .send(test3FailsOnWrongPermissions)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(403);
        expect(response.body).to.have.property('error');
      });
  });

  it('#04 - fails on method not found', async () => {
    return request
      .post('/')
      .send(test4FailsOnMethodNotFound)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(405);
        expect(response.body).to.have.property('error');
      });
  });

  it('#05 - passenger only', async () => {
    return request
      .post('/')
      .send(rpcCall(test5PassengerOnly))
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('result');
        expect(response.body.result).to.have.property('journey_id', test5PassengerOnly.journey_id);
      });
  });

  it('#06 - fails on no passenger and no driver', async () => {
    return request
      .post('/')
      .send(rpcCall(test6Nobody))
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
        expect(response.body.error).to.have.property('message', 'Invalid params');
      });
  });

  it('#07 - succeeds on missing driver', async () => {
    return request
      .post('/')
      .send(rpcCall(test7DriverOnly))
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('result');
        expect(response.body.result).to.have.property('journey_id', test7DriverOnly.journey_id);
      });
  });

  it('#08 - start date in the future', async () => {
    return request
      .post('/')
      .send(rpcCall(test8StartDateInTheFuture))
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(422);
        expect(response.body).to.have.property('error');
        expect(response.body.error).to.have.property('message');
      });
  });

  it('#09 - start date after end date', async () => {
    return request
      .post('/')
      .send(rpcCall(test9StartAfterEnd))
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
        expect(response.body.error).to.have.property('message');
      });
  });

  it('#10 - missing start date', async () => {
    return request
      .post('/')
      .send(rpcCall(test10MissingStartDate))
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
        expect(response.body.error).to.have.property('message');
      });
  });

  it('#11 - missing end date', async () => {
    return request
      .post('/')
      .send(rpcCall(test11MissingEndDate))
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
        expect(response.body.error).to.have.property('message');
      });
  });

  it('#12 - missing journey_id', async () => {
    return request
      .post('/')
      .send(rpcCall(test12MissingJourneyId))
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
        expect(response.body.error).to.have.property('message');
      });
  });

  it('#13 - missing operator_journey_id', async () => {
    return request
      .post('/')
      .send(rpcCall(test13MissingOperatorJourneyId))
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('result');
        expect(response.body.result).to.have.property('journey_id', test13MissingOperatorJourneyId.journey_id);
      });
  });

  it('#14 - start date is > 7 days in the past', async () => {
    return request
      .post('/')
      .send(rpcCall(test14JourneyTooOld))
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('result');
        expect(response.body.result).to.have.property('journey_id', test13MissingOperatorJourneyId.journey_id);
      });
  });

  it('#15 - passenger contribution < 0', async () => {
    return request
      .post('/')
      .send(rpcCall(test15ContributionTooLow))
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
        expect(response.body.error).to.have.property('message');
      });
  });

  it('#16 - driver revenue < 0', async () => {
    return request
      .post('/')
      .send(rpcCall(test16RevenueTooLow))
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
        expect(response.body.error).to.have.property('message');
      });
  });

  it('#17 - passenger seats < 1', async () => {
    return request
      .post('/')
      .send(rpcCall(test17SeatsTooLow))
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
        expect(response.body.error).to.have.property('message');
      });
  });

  it('#18 - operator_class is different than A,B,C', async () => {
    return request
      .post('/')
      .send(rpcCall(test18WrongOperatorClass))
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
        expect(response.body.error).to.have.property('message');
      });
  });

  it('#19 - wrong email format', async () => {
    return request
      .post('/')
      .send(rpcCall(test19WrongEmailFormat))
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
        expect(response.body.error).to.have.property('message');
      });
  });

  it('#20 - incentive SIRET is more than 14 numbers', async () => {
    return request
      .post('/')
      .send(rpcCall(test20WrongIncentiveSiret))
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
        expect(response.body.error).to.have.property('message');
      });
  });

  // #21 TODO

  it('#22 - Wrong incentive index', async () => {
    return request
      .post('/')
      .send(rpcCall(test22WrongIncentiveIndex))
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
        expect(response.body.error).to.have.property('message');
      });
  });

  it('#23 - Wrong incentive amount', async () => {
    return request
      .post('/')
      .send(rpcCall(test23WrongIncentiveAmount))
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
        expect(response.body.error).to.have.property('message');
      });
  });

  it('#24 - Wrong payment amount', async () => {
    return request
      .post('/')
      .send(rpcCall(test24WrongPaymentAmount))
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
        expect(response.body.error).to.have.property('message');
      });
  });

  it('#25 - Unsupported travel pass', async () => {
    return request
      .post('/')
      .send(rpcCall(test25UnsupportedTravelPass))
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
        expect(response.body.error).to.have.property('message');
      });
  });

  // it('#26 - Duplicate journey_id', async () => {
  //   // First Journey: OK
  //   await request
  //     .post('/')
  //     .send(rpcCall(test26DuplicateJourneyId))
  //     .set('Accept', 'application/json')
  //     .set('Content-Type', 'application/json')
  //     .expect((response: supertest.Response) => {
  //       expect(response.status).to.equal(200);
  //       expect(response.body).to.have.property('result');
  //       expect(response.body.result).to.have.property('journey_id', test26DuplicateJourneyId.journey_id);
  //     });

  //   // Second Journey: Conflict
  //   await request
  //     .post('/')
  //     .send(rpcCall(test26DuplicateJourneyId))
  //     .set('Accept', 'application/json')
  //     .set('Content-Type', 'application/json')
  //     .expect((response: supertest.Response) => {
  //       console.log(response.body);
  //       expect(response.status).to.equal(409);
  //       expect(response.body).to.have.property('error');
  //       expect(response.body.error).to.have.property('message');
  //     });
  // });
});

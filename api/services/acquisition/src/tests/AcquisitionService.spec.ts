import anyTest, { TestInterface } from 'ava';
import supertest from 'supertest';

import { TransportInterface } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { bootstrap } from '../bootstrap';
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
import { test27DistanceIsZero } from './mocks/test27DistanceIsZero';
import { test28DurationIsZero } from './mocks/test28DurationIsZero';

interface ContextType {
  transport: TransportInterface;
  request: any;
  user: { operator_id: number; operator_name: string; permissions: string[] };
  rpcCall: Function;
}

const test = anyTest as TestInterface<ContextType>;

test.before(async (t) => {
  t.context.transport = await bootstrap.boot('http', 0);
  t.context.request = supertest(t.context.transport.getInstance());
  t.context.user = { operator_id: 1, operator_name: 'MaxiCovoit', permissions: ['journey.create'] };
  t.context.rpcCall = callFactory(t.context.user);
});

test.after.always(async (t) => {
  const pgConnection = new PostgresConnection({ connectionString: process.env.APP_POSTGRES_URL });
  await pgConnection.getClient().query(`
    DELETE FROM acquisition.acquisitions
    WHERE journey_id IN (
      'test5PassengerOnly',
      'test7DriverOnly',
      'test13MissingOperatorJourneyId',
      'test14JourneyTooOld',
      'test26DuplicateJourneyId'
    )
  `);

  await pgConnection.down();
  await t.context.transport.down();
});

test('#01 - fails on empty payload', async (t) => {
  return t.context.request
    .post('/')
    .send(t.context.rpcCall())
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect((response: supertest.Response) => {
      t.is(response.status, 400);
      t.true('error' in response.body);
    });
});

test('#02 - fails on missing user authorization', async (t) => {
  return t.context.request
    .post('/')
    .send(test2MissingUserAuth)
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect((response: supertest.Response) => {
      t.is(response.status, 403);
      t.true('error' in response.body);
    });
});

test('#03 - fails on wrong permissions', async (t) => {
  return t.context.request
    .post('/')
    .send(test3FailsOnWrongPermissions)
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect((response: supertest.Response) => {
      t.is(response.status, 403);
      t.true('error' in response.body);
    });
});

test('#04 - fails on method not found', async (t) => {
  return t.context.request
    .post('/')
    .send(test4FailsOnMethodNotFound)
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect((response: supertest.Response) => {
      t.is(response.status, 405);
      t.true('error' in response.body);
    });
});

test('#05 - passenger only', async (t) => {
  return t.context.request
    .post('/')
    .send(t.context.rpcCall(test5PassengerOnly))
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect((response: supertest.Response) => {
      t.is(response.status, 200);
      t.true('result' in response.body);
      t.true('journey_id' in response.body.result);
      t.is(response.body.result.journey_id, test5PassengerOnly.journey_id);
    });
});

test('#06 - fails on no passenger and no driver', async (t) => {
  return t.context.request
    .post('/')
    .send(t.context.rpcCall(test6Nobody))
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect((response: supertest.Response) => {
      t.is(response.status, 400);
      t.true('error' in response.body);
      t.true('message' in response.body.error);
      t.is(response.body.error.message, 'Invalid params');
    });
});

test('#07 - succeeds on missing driver', async (t) => {
  return t.context.request
    .post('/')
    .send(t.context.rpcCall(test7DriverOnly))
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect((response: supertest.Response) => {
      t.is(response.status, 200);
      t.true('result' in response.body);
      t.true('journey_id' in response.body.result);
      t.is(response.body.result.journey_id, test7DriverOnly.journey_id);
    });
});

test('#08 - start date in the future', async (t) => {
  return t.context.request
    .post('/')
    .send(t.context.rpcCall(test8StartDateInTheFuture))
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect((response: supertest.Response) => {
      t.is(response.status, 422);
      t.true('error' in response.body);
      t.true('message' in response.body.error);
    });
});

test('#09 - start date after end date', async (t) => {
  return t.context.request
    .post('/')
    .send(t.context.rpcCall(test9StartAfterEnd))
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect((response: supertest.Response) => {
      t.is(response.status, 400);
      t.true('error' in response.body);
      t.true('message' in response.body.error);
    });
});

test('#10 - missing start date', async (t) => {
  return t.context.request
    .post('/')
    .send(t.context.rpcCall(test10MissingStartDate))
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect((response: supertest.Response) => {
      t.is(response.status, 400);
      t.true('error' in response.body);
      t.true('message' in response.body.error);
    });
});

test('#11 - missing end date', async (t) => {
  return t.context.request
    .post('/')
    .send(t.context.rpcCall(test11MissingEndDate))
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect((response: supertest.Response) => {
      t.is(response.status, 400);
      t.true('error' in response.body);
      t.true('message' in response.body.error);
    });
});

test('#12 - missing journey_id', async (t) => {
  return t.context.request
    .post('/')
    .send(t.context.rpcCall(test12MissingJourneyId))
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect((response: supertest.Response) => {
      t.is(response.status, 400);
      t.true('error' in response.body);
      t.true('message' in response.body.error);
    });
});

test('#13 - missing operator_journey_id', async (t) => {
  return t.context.request
    .post('/')
    .send(t.context.rpcCall(test13MissingOperatorJourneyId))
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect((response: supertest.Response) => {
      t.is(response.status, 200);
      t.true('result' in response.body);
      t.true('journey_id' in response.body.result);
      t.is(response.body.result.journey_id, test13MissingOperatorJourneyId.journey_id);
    });
});

test('#14 - start date is > 7 days in the past', async (t) => {
  return t.context.request
    .post('/')
    .send(t.context.rpcCall(test14JourneyTooOld))
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect((response: supertest.Response) => {
      t.is(response.status, 200);
      t.true('result' in response.body);
      t.true('journey_id' in response.body.result);
      t.is(response.body.result.journey_id, test14JourneyTooOld.journey_id);
    });
});

test('#15 - passenger contribution < 0', async (t) => {
  return t.context.request
    .post('/')
    .send(t.context.rpcCall(test15ContributionTooLow))
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect((response: supertest.Response) => {
      t.is(response.status, 400);
      t.true('error' in response.body);
      t.true('message' in response.body.error);
    });
});

test('#16 - driver revenue < 0', async (t) => {
  return t.context.request
    .post('/')
    .send(t.context.rpcCall(test16RevenueTooLow))
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect((response: supertest.Response) => {
      t.is(response.status, 400);
      t.true('error' in response.body);
      t.true('message' in response.body.error);
    });
});

test('#17 - passenger seats < 1', async (t) => {
  return t.context.request
    .post('/')
    .send(t.context.rpcCall(test17SeatsTooLow))
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect((response: supertest.Response) => {
      t.is(response.status, 400);
      t.true('error' in response.body);
      t.true('message' in response.body.error);
    });
});

test('#18 - operator_class is different than A,B,C', async (t) => {
  return t.context.request
    .post('/')
    .send(t.context.rpcCall(test18WrongOperatorClass))
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect((response: supertest.Response) => {
      t.is(response.status, 400);
      t.true('error' in response.body);
      t.true('message' in response.body.error);
    });
});

test('#19 - wrong email format', async (t) => {
  return t.context.request
    .post('/')
    .send(t.context.rpcCall(test19WrongEmailFormat))
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect((response: supertest.Response) => {
      t.is(response.status, 400);
      t.true('error' in response.body);
      t.true('message' in response.body.error);
    });
});

test('#20 - incentive SIRET is more than 14 numbers', async (t) => {
  return t.context.request
    .post('/')
    .send(t.context.rpcCall(test20WrongIncentiveSiret))
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect((response: supertest.Response) => {
      t.is(response.status, 400);
      t.true('error' in response.body);
      t.true('message' in response.body.error);
    });
});

test('#22 - Wrong incentive index', async (t) => {
  return t.context.request
    .post('/')
    .send(t.context.rpcCall(test22WrongIncentiveIndex))
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect((response: supertest.Response) => {
      t.is(response.status, 400);
      t.true('error' in response.body);
      t.true('message' in response.body.error);
    });
});

test('#23 - Wrong incentive amount', async (t) => {
  return t.context.request
    .post('/')
    .send(t.context.rpcCall(test23WrongIncentiveAmount))
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect((response: supertest.Response) => {
      t.is(response.status, 400);
      t.true('error' in response.body);
      t.true('message' in response.body.error);
    });
});

test('#24 - Wrong payment amount', async (t) => {
  return t.context.request
    .post('/')
    .send(t.context.rpcCall(test24WrongPaymentAmount))
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect((response: supertest.Response) => {
      t.is(response.status, 400);
      t.true('error' in response.body);
      t.true('message' in response.body.error);
    });
});

test('#25 - Unsupported travel pass', async (t) => {
  return t.context.request
    .post('/')
    .send(t.context.rpcCall(test25UnsupportedTravelPass))
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect((response: supertest.Response) => {
      t.is(response.status, 400);
      t.true('error' in response.body);
      t.true('message' in response.body.error);
    });
});

test('#26 - Duplicate journey_id', async (t) => {
  await t.context.request
    .post('/')
    .send(t.context.rpcCall(test26DuplicateJourneyId))
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect((response: supertest.Response) => {
      t.is(response.status, 200);
      t.true('result' in response.body);
      t.true('journey_id' in response.body.result);
      t.is(response.body.result.journey_id, test26DuplicateJourneyId.journey_id);
    });

  await t.context.request
    .post('/')
    .send(t.context.rpcCall(test26DuplicateJourneyId))
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect((response: supertest.Response) => {
      t.is(response.status, 409);
      t.true('error' in response.body);
      t.true('message' in response.body.error);
    });
});

test('#27 - distance is 0', async (t) => {
  return t.context.request
    .post('/')
    .send(t.context.rpcCall(test27DistanceIsZero))
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect((response: supertest.Response) => {
      t.is(response.status, 400);
      t.true('error' in response.body);
      t.true('message' in response.body.error);
    });
});

test('#28 - duration is 0', async (t) => {
  return t.context.request
    .post('/')
    .send(t.context.rpcCall(test28DurationIsZero))
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect((response: supertest.Response) => {
      t.is(response.status, 400);
      t.true('error' in response.body);
      t.true('message' in response.body.error);
    });
});

import anyTest, { TestFn } from 'ava';
import { handlerMacro, HandlerMacroContext, makeDbBeforeAfter, DbContext } from '@pdc/helper-test';
import { ServiceProvider } from '../ServiceProvider';
import { ParamsInterface, ResultInterface, handlerConfig } from '../shared/cee/registerApplication.contract';
import { config } from '../config';
import { ContextType } from '@ilos/common';
import {
  ceeJourneyTypeEnumSchema,
  drivingLicenseSchema,
  lastNameTruncSchema,
  operatorJourneyIdSchema,
  phoneTruncSchema,
  timestampSchema,
} from '../shared/cee/common/ceeSchema';

const { before, after, success, error } = handlerMacro<ParamsInterface, ResultInterface>(
  ServiceProvider,
  handlerConfig,
);
const { before: dbBefore, after: dbAfter } = makeDbBeforeAfter();

interface TestContext extends HandlerMacroContext {
  db: DbContext;
}

const test = anyTest as TestFn<TestContext>;
test.before(async (t) => {
  const db = await dbBefore();
  config.connections.postgres.connectionString = db.db.currentConnectionString;
  config.rules.validJourneyConstraint.start_date = new Date('2022-01-01');
  const { kernel } = await before();
  t.context = { db, kernel };
});

test.after(async (t) => {
  await after(t.context);
  await dbAfter(t.context.db);
});

const defaultContext: ContextType = {
  call: { user: { permissions: ['test.run'], operator_id: 1 } },
  channel: { service: 'dummy' },
};

const defaultShortPayload: any = {
  journey_type: 'short',
  last_name_trunc: 'ABC',
  driving_license: '051227308989',
  operator_journey_id: 'operator_journey_id-1',
};

const defaultLongPayload: any = {
  journey_type: 'long',
  last_name_trunc: 'ABC',
  driving_license: '051227308989',
  datetime: '2022-01-02T00:00:00.000Z',
  phone_trunc: '+336273488',
};

test.serial(
  error,
  { ...defaultShortPayload, last_name_trunc: 'abcd' },
  (e: any, t) => {
    t.is(e.message, 'Invalid params');
    t.is(e.rpcError?.data, `data/last_name_trunc ${lastNameTruncSchema.errorMessage}`);
  },
  defaultContext,
);

test.serial(
  error,
  { ...defaultShortPayload, journey_type: 'bip' },
  (e: any, t) => {
    t.is(e.message, 'Invalid params');
    t.is(e.rpcError?.data, `data/journey_type ${ceeJourneyTypeEnumSchema.errorMessage}`);
  },
  defaultContext,
);

test.serial(
  error,
  { ...defaultShortPayload, driving_license: 'bip' },
  (e: any, t) => {
    t.is(e.message, 'Invalid params');
    t.is(e.rpcError?.data, `data/driving_license ${drivingLicenseSchema.errorMessage}`);
  },
  defaultContext,
);

test.serial(
  error,
  { ...defaultShortPayload, operator_journey_id: 1 },
  (e: any, t) => {
    t.is(e.message, 'Invalid params');
    t.is(
      e.rpcError?.data,
      `data/operator_journey_id ${operatorJourneyIdSchema.errorMessage}, data must match "then" schema`,
    );
  },
  defaultContext,
);

test.serial(
  error,
  { ...defaultLongPayload, datetime: 'bip' },
  (e: any, t) => {
    t.is(e.message, 'Invalid params');
    t.is(e.rpcError?.data, `data/datetime ${timestampSchema.errorMessage}, data must match "then" schema`);
  },
  defaultContext,
);

test.serial(
  error,
  { ...defaultLongPayload, phone_trunc: 'bip' },
  (e: any, t) => {
    t.is(e.message, 'Invalid params');
    t.is(e.rpcError?.data, `data/phone_trunc ${phoneTruncSchema.errorMessage}, data must match "then" schema`);
  },
  defaultContext,
);

test.serial(error, defaultShortPayload, 'Unauthorized Error', { ...defaultContext, call: { user: {} } });

test.serial(
  error,
  { ...defaultLongPayload, datetime: new Date().toISOString() },
  (e: any, t) => {
    t.is(e.message, 'Invalid params');
    t.is(e.rpcError?.data, `Date should be before 7 days from now`);
  },
  defaultContext,
);

test.serial(
  success,
  defaultShortPayload,
  {
    datetime: '2022-06-15T00:15:00.000Z',
    journey_id: 1,
    status: 'ok',
    token: 'TODO',
  },
  defaultContext,
);

test.serial(
  error,
  { ...defaultShortPayload, operator_journey_id: 'operator_journey_id-2' },
  (e: any, t) => {
    t.log(e);
    t.is(e.message, 'Conflict');
    t.like(e.rpcError.data, { datetime: '2022-06-15T00:15:00.000Z' });
  },
  defaultContext,
);

test.serial(
  error,
  { ...defaultShortPayload, operator_journey_id: 'operator_journey_id-wrong' },
  (e: any, t) => {
    t.log(e);
    t.is(e.message, 'Not found');
  },
  defaultContext,
);

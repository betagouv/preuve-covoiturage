import anyTest, { TestFn } from 'ava';
import { handlerMacro, HandlerMacroContext, makeDbBeforeAfter, DbContext } from '@pdc/helper-test';
import { ServiceProvider } from '../ServiceProvider';
import { ParamsInterface, ResultInterface, handlerConfig } from '../shared/cee/simulateApplication.contract';
import { signature } from '../shared/cee/registerApplication.contract';
import { config } from '../config';
import { ContextType } from '@ilos/common';
import {
  ceeJourneyTypeEnumSchema,
  drivingLicenseSchema,
  lastNameTruncSchema,
  phoneTruncSchema,
} from '../shared/cee/common/ceeSchema';

const { before, after, success, error } = handlerMacro<ParamsInterface, ResultInterface>(
  ServiceProvider,
  handlerConfig,
);
const { before: dbBefore, after: dbAfter } = makeDbBeforeAfter();

interface TestContext extends HandlerMacroContext {
  db: DbContext;
}

const defaultContext: ContextType = {
  call: { user: { permissions: ['test.run'], operator_id: 1 } },
  channel: { service: 'dummy' },
};

const test = anyTest as TestFn<TestContext>;
test.before(async (t) => {
  const db = await dbBefore();
  config.connections.postgres.connectionString = db.db.currentConnectionString;
  config.rules.validJourneyConstraint.start_date = new Date('2022-01-01');
  const { kernel } = await before();
  await kernel.call(
    signature,
    {
      journey_type: 'long',
      last_name_trunc: 'ABC',
      driving_license: '051227308989',
      datetime: '2022-01-02T00:00:00.000Z',
      application_timestamp: '2022-01-02T00:00:00.000Z',
      phone_trunc: '+336273488',
      identity_key: '0000000000000000000000000000000000000000000000000000000000000000',
    },
    defaultContext,
  );
  t.context = { db, kernel };
});

test.after(async (t) => {
  await after(t.context);
  await dbAfter(t.context.db);
});

const defaultShortPayload: any = {
  journey_type: 'short',
  last_name_trunc: 'DEF',
  phone_trunc: '+336273488',
  driving_license: '051227308990',
  identity_key: '0000000000000000000000000000000000000000000000000000000000000000',
};

const defaultLongPayload: any = {
  journey_type: 'long',
  last_name_trunc: 'ABC',
  phone_trunc: '+336273488',
  driving_license: '051227308989',
  identity_key: '0000000000000000000000000000000000000000000000000000000000000000',
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
  { ...defaultLongPayload, phone_trunc: 'bip' },
  (e: any, t) => {
    t.is(e.message, 'Invalid params');
    t.is(e.rpcError?.data, `data/phone_trunc ${phoneTruncSchema.errorMessage}`);
  },
  defaultContext,
);

test.serial(error, defaultShortPayload, 'Unauthorized Error', { ...defaultContext, call: { user: {} } });

test.serial(success, defaultShortPayload, undefined, defaultContext);

test.serial(
  error,
  defaultLongPayload,
  (e: any, t) => {
    t.log(e);
    t.is(e.message, 'Conflict');
    t.like(e.rpcError.data, { datetime: '2022-01-02T00:00:00.000Z' });
  },
  defaultContext,
);

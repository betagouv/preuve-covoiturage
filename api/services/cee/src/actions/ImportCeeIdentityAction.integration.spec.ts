import anyTest, { TestFn } from 'ava';
import { handlerMacro, HandlerMacroContext, makeDbBeforeAfter, DbContext } from '@pdc/helper-test';
import { ServiceProvider } from '../ServiceProvider';
import { ParamsInterface, ResultInterface, handlerConfig } from '../shared/cee/importApplicationIdentity.contract';
import { config } from '../config';
import { ContextType } from '@ilos/common';
import {
  ceeJourneyTypeEnumSchema,
  lastNameTruncSchema,
  phoneTruncSchema,
  timestampSchema,
} from '../shared/cee/common/ceeSchema';

const { before, after, error } = handlerMacro<ParamsInterface, ResultInterface>(
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

const defaultPayload: any = {
  cee_application_type: 'specific',
  identity_key: 'oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo',
  journey_type: 'short',
  last_name_trunc: 'ABC',
  phone_trunc: '+336273488',
  datetime: '2023-01-02T00:00:00.000Z',
};

test.serial(
  error,
  [],
  (e: any, t) => {
    t.is(e.message, 'Invalid params');
    t.is(e.rpcError?.data, 'data must NOT have fewer than 1 items');
  },
  defaultContext,
);

test.serial(
  error,
  [{ ...defaultPayload, last_name_trunc: 'abcd' }],
  (e: any, t) => {
    t.is(e.message, 'Invalid params');
    t.is(e.rpcError?.data, `data/0/last_name_trunc ${lastNameTruncSchema.errorMessage}`);
  },
  defaultContext,
);

test.serial(
  error,
  [{ ...defaultPayload, journey_type: 'bip' }],
  (e: any, t) => {
    t.is(e.message, 'Invalid params');
    t.is(e.rpcError?.data, `data/0/journey_type ${ceeJourneyTypeEnumSchema.errorMessage}`);
  },
  defaultContext,
);

test.serial(
  error,
  [{ ...defaultPayload, datetime: 'bip' }],
  (e: any, t) => {
    t.is(e.message, 'Invalid params');
    t.is(e.rpcError?.data, `data/0/datetime ${timestampSchema.errorMessage}`);
  },
  defaultContext,
);

test.serial(
  error,
  [{ ...defaultPayload, phone_trunc: 'bip' }],
  (e: any, t) => {
    t.is(e.message, 'Invalid params');
    t.is(e.rpcError?.data, `data/0/phone_trunc ${phoneTruncSchema.errorMessage}`);
  },
  defaultContext,
);

test.serial(error, [defaultPayload], 'Unauthorized Error', { ...defaultContext, call: { user: {} } });

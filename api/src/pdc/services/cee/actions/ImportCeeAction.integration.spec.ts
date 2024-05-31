import { ContextType } from '@ilos/common/index.ts';
import { PostgresConnection } from '@ilos/connection-postgres/index.ts';
import { DbContext, HandlerMacroContext, handlerMacro, makeDbBeforeAfter } from '@pdc/providers/test/index.ts';
import {
  ceeJourneyTypeEnumSchema,
  lastNameTruncSchema,
  phoneTruncSchema,
  timestampSchema,
} from '@shared/cee/common/ceeSchema.ts';
import { ParamsInterface, ResultInterface, handlerConfig } from '@shared/cee/importApplication.contract.ts';
import anyTest, { TestFn } from 'ava';
import { ServiceProvider } from '../ServiceProvider.ts';

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
  const { kernel } = await before();
  kernel
    .getContainer()
    .rebind(PostgresConnection)
    .toConstantValue(new PostgresConnection({ connectionString: db.db.currentConnectionString }));
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
  journey_type: 'short',
  last_name_trunc: 'ABC',
  phone_trunc: '+336273488',
  datetime: '2023-01-02T00:00:00.000Z',
};

test.serial(
  'Invalid params empty',
  error,
  [],
  (e: any, t) => {
    t.is(e.message, 'Invalid params');
    t.is(e.rpcError?.data[0], ': must NOT have fewer than 1 items');
  },
  defaultContext,
);

test.serial(
  'Invalid params last_name_trunc',
  error,
  [{ ...defaultPayload, last_name_trunc: 'abcd' }],
  (e: any, t) => {
    t.is(e.message, 'Invalid params');
    t.is(e.rpcError?.data[0], `/0/last_name_trunc: ${lastNameTruncSchema.errorMessage}`);
  },
  defaultContext,
);

test.serial(
  'Invalid params unsupported journey type',
  error,
  [{ ...defaultPayload, journey_type: 'bip' }],
  (e: any, t) => {
    t.is(e.message, 'Invalid params');
    t.is(e.rpcError?.data[0], `/0/journey_type: ${ceeJourneyTypeEnumSchema.errorMessage}`);
  },
  defaultContext,
);

test.serial(
  'Invalid params datetime',
  error,
  [{ ...defaultPayload, datetime: 'bip' }],
  (e: any, t) => {
    t.is(e.message, 'Invalid params');
    t.is(e.rpcError?.data[0], `/0/datetime: ${timestampSchema.errorMessage}`);
  },
  defaultContext,
);

test.serial(
  'Invalid params phone_trunc',
  error,
  [{ ...defaultPayload, phone_trunc: 'bip' }],
  (e: any, t) => {
    t.is(e.message, 'Invalid params');
    t.is(e.rpcError?.data[0], `/0/phone_trunc: ${phoneTruncSchema.errorMessage}`);
  },
  defaultContext,
);

test.serial('Unauthorized', error, [defaultPayload], 'Unauthorized Error', { ...defaultContext, call: { user: {} } });

test.serial(
  'Success',
  success,
  [defaultPayload, defaultPayload],
  {
    failed: 1,
    failed_details: [
      {
        ...defaultPayload,
        error: 'Conflict',
      },
    ],
    imported: 1,
  },
  defaultContext,
);

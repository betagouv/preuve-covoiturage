import anyTest, { TestFn } from 'ava';
import { handlerMacro, HandlerMacroContext, makeDbBeforeAfter, DbContext } from '@pdc/helper-test';
import { ServiceProvider } from '../ServiceProvider';
import { ParamsInterface, ResultInterface, handlerConfig } from '../shared/cee/importApplication.contract';
import { config } from '../config';
import { ContextType } from '@ilos/common';

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
}

const defaultPayload: any = {
    journey_type: 'short',
    last_name_trunc: 'ABC',
    phone_trunc: '+336273488',
    datetime: '2023-01-02T00:00:00.000Z'
};

test.serial(error, [], (e: any, t) => {
  t.is(e.message, 'Invalid params');
  t.is(e.rpcError?.data, 'data must NOT have fewer than 1 items');
}, defaultContext);

test.serial(error, [{ ...defaultPayload, last_name_trunc: 'abcd' }], (e: any, t) => {
  t.is(e.message, 'Invalid params');
  t.is(e.rpcError?.data, 'data/0/last_name_trunc must NOT have more than 3 characters, data/0/last_name_trunc must match pattern "^[A-Z ]{3}$"');
}, defaultContext);

test.serial(error, [{ ...defaultPayload, journey_type: 'bip' }], (e: any, t) => {
  t.is(e.message, 'Invalid params');
  t.is(e.rpcError?.data, 'data/0/journey_type must be equal to one of the allowed values');
}, defaultContext);

test.serial(error, [{ ...defaultPayload, datetime: 'bip' }], (e: any, t) => {
  t.is(e.message, 'Invalid params');
  t.is(e.rpcError?.data, 'data/0/datetime must pass "cast" keyword validation');
}, defaultContext);

test.serial(error, [{ ...defaultPayload, phone_trunc: 'bip' }], (e: any, t) => {
  t.is(e.message, 'Invalid params');
  t.is(e.rpcError?.data, 'data/0/phone_trunc must NOT have fewer than 8 characters, data/0/phone_trunc must match format "phonetrunc", data/0/phone_trunc must pass "macro" keyword validation');
}, defaultContext);

test.serial(error, [defaultPayload], 'Unauthorized Error', { ...defaultContext, call: { user: {}} });

test.serial(success, [defaultPayload, defaultPayload], {
  failed: 1,
  failed_details: [ { ...defaultPayload, error: 'duplicate key value violates unique constraint "cee_operator_id_journey_type_is_specific_uniqueness"' }],
  imported: 1,
}, defaultContext);

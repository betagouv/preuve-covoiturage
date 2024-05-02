import { ContextType } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import { CarpoolV1StatusEnum } from '@pdc/providers/carpool/interfaces';
import { DbContext, HandlerMacroContext, handlerMacro, makeDbBeforeAfter } from '@pdc/providers/test';
import {
  ceeJourneyTypeEnumSchema,
  drivingLicenseSchema,
  lastNameTruncSchema,
  operatorJourneyIdSchema,
  phoneTruncSchema,
  timestampSchema,
} from '@shared/cee/common/ceeSchema';
import { ParamsInterface, ResultInterface, handlerConfig } from '@shared/cee/registerApplication.contract';
import anyTest, { TestFn } from 'ava';
import { createSign } from 'crypto';
import { ServiceProvider } from '../ServiceProvider';
import { config } from '../config';

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
  config.rules.validJourneyConstraint.start_date = new Date('2022-01-01');
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

const defaultShortPayload: any = {
  journey_type: 'short',
  last_name_trunc: 'ABC',
  driving_license: '051227308989',
  application_timestamp: '2022-01-02T00:00:00.000Z',
  operator_journey_id: 'operator_journey_id-1',
  identity_key: '0000000000000000000000000000000000000000000000000000000000000000',
};

const defaultLongPayload: any = {
  journey_type: 'long',
  last_name_trunc: 'ABC',
  driving_license: '051227308989',
  datetime: '2022-01-02T00:00:00.000Z',
  application_timestamp: '2022-01-02T00:00:00.000Z',
  phone_trunc: '+336273488',
  identity_key: '0000000000000000000000000000000000000000000000000000000000000000',
};

test.serial(
  'Invalid last_name_trunc param',
  error,
  { ...defaultShortPayload, last_name_trunc: 'abcd' },
  (e: any, t) => {
    t.is(e.message, 'Invalid params');
    t.is(e.rpcError?.data[0], `/last_name_trunc: ${lastNameTruncSchema.errorMessage}`);
  },
  defaultContext,
);

test.serial(
  'Invalid journey_type param',
  error,
  { ...defaultShortPayload, journey_type: 'bip' },
  (e: any, t) => {
    t.is(e.message, 'Invalid params');
    t.is(e.rpcError?.data[0], `/journey_type: ${ceeJourneyTypeEnumSchema.errorMessage}`);
  },
  defaultContext,
);

test.serial(
  'Invalid driving license param',
  error,
  { ...defaultShortPayload, driving_license: 'bip' },
  (e: any, t) => {
    t.is(e.message, 'Invalid params');
    t.is(e.rpcError?.data[0], `/driving_license: ${drivingLicenseSchema.errorMessage}`);
  },
  defaultContext,
);

test.serial(
  'Invalid operator_journey_id param',
  error,
  { ...defaultShortPayload, operator_journey_id: 1 },
  (e: any, t) => {
    t.is(e.message, 'Invalid params');
    t.deepEqual(e.rpcError?.data, [
      `/operator_journey_id: ${operatorJourneyIdSchema.errorMessage}`,
      ': must match "then" schema',
    ]);
  },
  defaultContext,
);

test.serial(
  'Invalid datetime param',
  error,
  { ...defaultLongPayload, datetime: 'bip' },
  (e: any, t) => {
    t.is(e.message, 'Invalid params');
    t.deepEqual(e.rpcError?.data, [`/datetime: ${timestampSchema.errorMessage}`, ': must match "then" schema']);
  },
  defaultContext,
);

test.serial(
  'Invalid phone_trunc param',
  error,
  { ...defaultLongPayload, phone_trunc: 'bip' },
  (e: any, t) => {
    t.is(e.message, 'Invalid params');
    t.deepEqual(e.rpcError?.data, [`/phone_trunc: ${phoneTruncSchema.errorMessage}`, ': must match "then" schema']);
  },
  defaultContext,
);

test.serial('Unauthorized access', error, defaultShortPayload, 'Unauthorized Error', {
  ...defaultContext,
  call: { user: {} },
});

test.serial(
  'Invalid data params',
  error,
  { ...defaultLongPayload, datetime: new Date().toISOString() },
  (e: any, t) => {
    t.is(e.message, 'Invalid params');
    t.is(e.rpcError?.data, `Date should be before 7 days from now`);
  },
  defaultContext,
);

test.serial(
  'Successful short distance application',
  success,
  defaultShortPayload,
  {
    datetime: '2024-03-15T00:15:00.000Z',
    journey_id: 'operator_journey_id-1',
    status: CarpoolV1StatusEnum.Ok,
    token: (function (): string {
      const private_key = config.signature.private_key as string;
      const signer = createSign('RSA-SHA512');
      signer.write(
        ['89248032800012', 'short', defaultShortPayload.driving_license, '2024-03-15T00:15:00.000Z'].join('/'),
      );
      signer.end();
      return signer.sign(private_key, 'base64');
    })(),
  },
  defaultContext,
);

test.serial(
  'Conflicting short distance operator_journey_id',
  error,
  { ...defaultShortPayload, operator_journey_id: 'operator_journey_id-3' },
  (e: any, t) => {
    t.is(e.message, 'Conflict');
    t.like(e.rpcError.data, { datetime: '2024-03-15T00:15:00.000Z' });
  },
  defaultContext,
);

test.serial(
  'Wrong operator_journey_id',
  error,
  { ...defaultShortPayload, operator_journey_id: 'operator_journey_id-wrong' },
  (e: any, t) => {
    t.is(e.message, 'Not found');
  },
  defaultContext,
);

test.serial('Should have register errors', async (t) => {
  const result = await t.context.db.connection.getClient().query(`
    SELECT * FROM cee.cee_application_errors ORDER BY created_at
  `);
  t.is(result.rowCount, 3);
  t.like(result.rows[0], { error_type: 'date' });
  t.like(result.rows[1], { error_type: 'conflict' });
  t.like(result.rows[2], { error_type: 'non-eligible' });
});

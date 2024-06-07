import { DbContext, makeDbBeforeAfter } from '@/pdc/providers/test/index.ts';
import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';

import { PolicyStatusEnum } from '@/shared/policy/common/interfaces/PolicyInterface.ts';
import { SerializedPolicyInterface } from '../interfaces/index.ts';
import { PolicyRepositoryProvider } from './PolicyRepositoryProvider.ts';

interface TestContext {
  repository: PolicyRepositoryProvider;
  territory_id: number;
  policy: SerializedPolicyInterface;
  db: DbContext;
}

const test = anyTest as TestFn<TestContext>;

function makePolicy(data: Partial<SerializedPolicyInterface> = {}): Omit<SerializedPolicyInterface, '_id'> {
  const start_date = new Date();
  start_date.setDate(-7);
  const end_date = new Date();
  end_date.setDate(end_date.getDate() + 7);

  return {
    territory_id: 1,
    territory_selector: {},
    name: 'policy',
    start_date,
    end_date,
    tz: 'Europe/Paris',
    status: PolicyStatusEnum.DRAFT,
    handler: 'Idfm',
    incentive_sum: 5000,
    max_amount: 10_000_000_00,
    ...data,
  };
}
const { before, after } = makeDbBeforeAfter();

beforeAll(async (t) => {
  t.context.territory_id = 1;
  const db = await before();
  t.context.db = db;
  t.context.repository = new PolicyRepositoryProvider(t.context.db.connection);
  t.context.policy = { ...makePolicy(), _id: 0 };
  t.context.territory_id = 1;
});

test.after.always(async (t) => {
  await after(t.context.db);
});

it('Should create policy', async (t) => {
  const { _id, ...policyData } = t.context.policy;
  const policy = await t.context.repository.create(policyData);

  const result = await t.context.db.connection.getClient().query({
    text: `SELECT * FROM ${t.context.repository.table} WHERE _id = $1`,
    values: [policy._id],
  });

  assertEquals(result.rowCount, 1);
  assertEquals(result.rows[0].name, policyData.name);
  assertEquals(result.rows[0].status, 'draft');
  t.context.policy._id = policy._id;
});

it('Should find policy', async (t) => {
  const policy = await t.context.repository.find(t.context.policy._id);
  assertEquals(policy?.name, t.context.policy.name);
  assertEquals(policy?.status, t.context.policy.status);
});

it('Should find policy by territory', async (t) => {
  const policy = await t.context.repository.find(t.context.policy._id, t.context.territory_id);
  assertEquals(policy?.name, t.context.policy.name);
  assertEquals(policy?.status, t.context.policy.status);
});

it('Should find policy where territory', async (t) => {
  const policies = await t.context.repository.findWhere({ territory_id: t.context.territory_id });
  assert(Array.isArray(policies));
  assertEquals(policies.length, 1);
  const policy = policies.pop();
  assertEquals(policy?.name, t.context.policy.name);
  assertEquals(policy?.status, t.context.policy.status);
});

it('Should not find policy by territory', async (t) => {
  const policy = await t.context.repository.find(t.context.policy._id, 2);
  assertEquals(policy, undefined);
});

it('Should patch policy', async (t) => {
  const name = 'Awesome policy';
  const policy = await t.context.repository.patch({ ...t.context.policy, name });

  const result = await t.context.db.connection.getClient().query({
    text: `SELECT * FROM ${t.context.repository.table} WHERE _id = $1`,
    values: [t.context.policy._id],
  });

  t.not(policy.name, t.context.policy.name);
  assertEquals(policy.name, name);
  assertEquals(result.rowCount, 1);
  assertEquals(result.rows[0].name, name);
  t.context.policy.name = name;
});

it('Should delete policy', async (t) => {
  await t.context.repository.delete(t.context.policy._id);

  const result = await t.context.db.connection.getClient().query({
    text: `SELECT deleted_at FROM ${t.context.repository.table} WHERE _id = $1`,
    values: [t.context.policy._id],
  });

  assertEquals(result.rowCount, 1);
  t.not(result.rows[0].deleted_at, null);
});

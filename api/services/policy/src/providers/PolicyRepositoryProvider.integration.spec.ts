import anyTest, { TestFn } from 'ava';
import { makeDbBeforeAfter, DbContext } from '@pdc/helper-test';

import { PolicyRepositoryProvider } from './PolicyRepositoryProvider';
import { SerializedPolicyInterface } from '../interfaces';

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
    status: 'draft',
    handler: 'Idfm',
    incentive_sum: 5000,
    ...data,
  };
}
const { before, after } = makeDbBeforeAfter();

test.before(async (t) => {
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

test.serial('Should create policy', async (t) => {
  const { _id, ...policyData } = t.context.policy;
  const policy = await t.context.repository.create(policyData);

  const result = await t.context.db.connection.getClient().query({
    text: `SELECT * FROM ${t.context.repository.table} WHERE _id = $1`,
    values: [policy._id],
  });

  t.is(result.rowCount, 1);
  t.is(result.rows[0].name, policyData.name);
  t.is(result.rows[0].status, 'draft');
  t.context.policy._id = policy._id;
});

test.serial('Should find policy', async (t) => {
  const policy = await t.context.repository.find(t.context.policy._id);
  t.is(policy?.name, t.context.policy.name);
  t.is(policy?.status, t.context.policy.status);
});

test.serial('Should find policy by territory', async (t) => {
  const policy = await t.context.repository.find(t.context.policy._id, t.context.territory_id);
  t.is(policy?.name, t.context.policy.name);
  t.is(policy?.status, t.context.policy.status);
});

test.serial('Should find policy where territory', async (t) => {
  const policies = await t.context.repository.findWhere({ territory_id: t.context.territory_id });
  t.true(Array.isArray(policies));
  t.is(policies.length, 1);
  const policy = policies.pop();
  t.is(policy?.name, t.context.policy.name);
  t.is(policy?.status, t.context.policy.status);
});

test.serial('Should not find policy by territory', async (t) => {
  const policy = await t.context.repository.find(t.context.policy._id, 2);
  t.is(policy, undefined);
});

test.serial('Should patch policy', async (t) => {
  const name = 'Awesome policy';
  const policy = await t.context.repository.patch({ ...t.context.policy, name });

  const result = await t.context.db.connection.getClient().query({
    text: `SELECT * FROM ${t.context.repository.table} WHERE _id = $1`,
    values: [t.context.policy._id],
  });

  t.not(policy.name, t.context.policy.name);
  t.is(policy.name, name);
  t.is(result.rowCount, 1);
  t.is(result.rows[0].name, name);
  t.context.policy.name = name;
});

test.serial('Should delete policy', async (t) => {
  await t.context.repository.delete(t.context.policy._id);

  const result = await t.context.db.connection.getClient().query({
    text: `SELECT deleted_at FROM ${t.context.repository.table} WHERE _id = $1`,
    values: [t.context.policy._id],
  });

  t.is(result.rowCount, 1);
  t.not(result.rows[0].deleted_at, null);
});

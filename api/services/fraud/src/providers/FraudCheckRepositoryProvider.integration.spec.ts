import anyTest, { TestFn } from 'ava';
import { makeDbBeforeAfter, DbContext } from '@pdc/helper-test';
import { FraudCheckRepositoryProvider } from './FraudCheckRepositoryProvider';
import { FraudCheckEntry, FraudCheckStatusEnum } from '../interfaces';

interface TestContext {
  repository: FraudCheckRepositoryProvider;
  operator_id: number;
  db: DbContext;
}

const test = anyTest as TestFn<TestContext>;
const { before, after } = makeDbBeforeAfter();

test.before(async (t) => {
  const db = await before();
  t.context.db = db;
  t.context.repository = new FraudCheckRepositoryProvider(t.context.db.connection);
});

test.after.always(async (t) => {
  await after(t.context.db);
});

function createFraudCheck(data: Partial<FraudCheckEntry> = {}): FraudCheckEntry {
  return {
    acquisition_id: 1,
    status: FraudCheckStatusEnum.Done,
    karma: 0.54,
    data: [],
    ...data,
  };
}

test.serial('Should create fraudcheck', async (t) => {
  const subtest = {
    acquisition_id: 2,
    uuid: 'eac74c58-9907-4b93-b8e9-879637a0f534',
    karma: 0.54,
    method: 'test',
    status: FraudCheckStatusEnum.Done,
  };
  const data = createFraudCheck({ acquisition_id: 1, data: [subtest] });
  await t.context.repository.createOrUpdate(data);
  const result = await t.context.db.connection.getClient().query({
    text: `
      SELECT
        *
      FROM ${t.context.repository.table}
      WHERE acquisition_id = $1
    `,
    values: [data.acquisition_id],
  });
  t.is(result.rowCount, 1);
  t.like(result.rows[0], {
    acquisition_id: data.acquisition_id,
    karma: data.karma,
    status: data.status,
  });
  const subResult = await t.context.db.connection.getClient().query({
    text: `
      SELECT
        *
      FROM ${t.context.repository.resultTable}
      WHERE acquisition_id = $1
    `,
    values: [subtest.acquisition_id],
  });
  t.is(subResult.rowCount, 1);
  t.like(subResult.rows[0], subtest);
});

test.serial('Should update fraudcheck', async (t) => {
  const data = createFraudCheck({ status: FraudCheckStatusEnum.Pending });
  await t.context.repository.createOrUpdate(data);
  const result = await t.context.db.connection.getClient().query({
    text: `
      SELECT
        *
      FROM ${t.context.repository.table}
      WHERE acquisition_id = $1
    `,
    values: [1],
  });

  t.is(result.rowCount, 1);
  t.like(result.rows[0], { status: FraudCheckStatusEnum.Pending });
});

test.serial('Should find with date selectors', async (t) => {
  const data = createFraudCheck({ acquisition_id: 2, status: FraudCheckStatusEnum.Pending });
  await t.context.repository.createOrUpdate(data);
  const [result, fn] = await t.context.repository.findThenUpdate({
    limit: 2,
    status: FraudCheckStatusEnum.Pending,
    from: new Date(),
  });

  t.deepEqual(result, []);
  await fn();
});

test.serial('Should find then update with selectors', async (t) => {
  const [result, fn] = await t.context.repository.findThenUpdate({
    limit: 2,
    status: FraudCheckStatusEnum.Pending,
    to: new Date(),
  });

  t.deepEqual(result, [1, 2]);
  const data = createFraudCheck({ acquisition_id: 1, status: FraudCheckStatusEnum.Pending, karma: 1 });
  await fn(data);
  await fn();

  const res = await t.context.db.connection.getClient().query({
    text: `
      SELECT
        *
      FROM ${t.context.repository.table}
      WHERE acquisition_id = $1
    `,
    values: [1],
  });

  t.is(res.rowCount, 1);
  t.like(res.rows[0], { karma: 1 });
});

test.serial('Should find and update with lock', async (t) => {
  const [result1, fn1] = await t.context.repository.findThenUpdate({
    limit: 1,
    status: FraudCheckStatusEnum.Pending,
  });

  t.deepEqual(result1, [1]);

  const [result2, fn2] = await t.context.repository.findThenUpdate({
    limit: 1,
    status: FraudCheckStatusEnum.Pending,
  });

  t.deepEqual(result2, [2]);

  await fn1(); // release lock 1
  const [result3, fn3] = await t.context.repository.findThenUpdate({
    limit: 1,
    status: FraudCheckStatusEnum.Pending,
  });
  t.deepEqual(result3, [1]);

  await fn2({ acquisition_id: 2, status: FraudCheckStatusEnum.Done, karma: 0.5, data: [] });
  await fn2(); // release lock 2

  const [result4, fn4] = await t.context.repository.findThenUpdate({
    limit: 1,
    status: FraudCheckStatusEnum.Pending,
  });

  t.deepEqual(result4, []);
  await fn3(); // release lock 3
  await fn4(); // release lock 3
});

test.serial('Should find with lock timeout', async (t) => {
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  await t.context.db.connection.getClient().query({
    text: `UPDATE ${t.context.repository.table} SET status = 'pending'`,
    values: [],
  });

  const [result1, fn1] = await t.context.repository.findThenUpdate(
    {
      limit: 1,
      status: FraudCheckStatusEnum.Pending,
    },
    1000,
  );
  t.deepEqual(result1, [1]);
  await delay(1500);

  const [result2, fn2] = await t.context.repository.findThenUpdate({
    limit: 1,
    status: FraudCheckStatusEnum.Pending,
  });
  t.deepEqual(result2, [1]);
  await fn1(); // release lock 1
  await fn2(); // release lock 2
});

test.serial('Should rollback if update error', async (t) => {
  const [result1, fn1] = await t.context.repository.findThenUpdate(
    {
      limit: 1,
      status: FraudCheckStatusEnum.Pending,
    },
    1000,
  );
  t.deepEqual(result1, [1]);

  await t.notThrowsAsync(async () => {
    const data = createFraudCheck({ acquisition_id: result1[0] });
    await fn1({ ...data, status: 'status_not_existing' as FraudCheckStatusEnum });
  });

  await fn1();
  const [result2, fn2] = await t.context.repository.findThenUpdate({
    limit: 1,
    status: FraudCheckStatusEnum.Pending,
  });
  t.deepEqual(result2, [1]);
  await fn2();
});

test.serial('Should rollback if find error', async (t) => {
  await t.throwsAsync(async () => {
    await t.context.repository.findThenUpdate(
      {
        limit: 'wrong' as unknown as number,
        status: FraudCheckStatusEnum.Pending,
      },
      1000,
    );
  });
});

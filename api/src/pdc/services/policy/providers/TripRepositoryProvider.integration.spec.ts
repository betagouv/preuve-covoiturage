import { DbContext, makeDbBeforeAfter } from '@pdc/providers/test';
import { PolicyStatusEnum } from '@shared/policy/common/interfaces/PolicyInterface';
import anyTest, { TestFn } from 'ava';
import { Policy } from '../engine/entities/Policy';
import { Idfm } from '../engine/policies/Idfm';
import { TripRepositoryProvider } from './TripRepositoryProvider';

interface TestContext {
  db: DbContext;
  repository: TripRepositoryProvider;
}

const test = anyTest as TestFn<TestContext>;
const { before, after } = makeDbBeforeAfter();

test.before(async (t) => {
  const db = await before();
  t.context.db = db;
  t.context.repository = new TripRepositoryProvider(t.context.db.connection);
});

test.after.always(async (t) => {
  await after(t.context.db);
});

test.serial('Should find carpools even with fraudcheck_error', async (t) => {
  const start_date = new Date('2022-06-01');
  const end_date = new Date('2022-06-30');

  const policy = await Policy.import({
    _id: 1,
    territory_id: 1,
    territory_selector: { aom: ['217500016'] },
    start_date,
    end_date,
    tz: 'Europe/Paris',
    name: 'Policy',
    handler: Idfm.id,
    status: PolicyStatusEnum.ACTIVE,
    incentive_sum: 5000,
    max_amount: 10_000_000_00,
  });

  const cursor = t.context.repository.findTripByPolicy(policy, start_date, end_date);
  const { value } = await cursor.next(); // ok carpool
  await cursor.next(); // ok carpool
  await cursor.next(); // fraudcheck_error carpool
  t.is((value || []).length, 3);
  t.true(Array.isArray(value));
  t.deepEqual(
    (value || [])
      .map((c) => ({
        start: c.start,
        end: c.end,
        operator_uuid: c.operator_uuid,
        datetime: c.datetime,
        distance: c.distance,
        duration: c.duration,
      }))
      .shift(),
    {
      start: {
        aom: '217500016',
        arr: '91471',
        com: '91471',
        country: 'XXXXX',
        dep: '91',
        epci: '200056232',
        reg: '11',
        reseau: 232,
      },
      end: {
        aom: '217500016',
        arr: '91377',
        com: '91377',
        country: 'XXXXX',
        dep: '91',
        epci: '200056232',
        reg: '11',
        reseau: 232,
      },
      operator_uuid: '25a8774f-8708-4cf7-8527-446106b64a35',
      datetime: new Date('2022-06-15'),
      distance: 10000,
      duration: 900,
    },
  );
});

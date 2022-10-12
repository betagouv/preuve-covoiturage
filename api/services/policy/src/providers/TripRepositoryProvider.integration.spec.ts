import anyTest, { TestFn } from 'ava';
import { makeDbBeforeAfter, DbContext } from '@pdc/helper-test';
import { Policy } from '../engine/entities/Policy';
import { TripRepositoryProvider } from './TripRepositoryProvider';
import { Idfm } from '../engine/policies/Idfm';

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

test.serial('Should find carpools', async (t) => {
  const start_date = new Date('2022-06-01');
  const end_date = new Date('2022-06-30');

  const policy = await Policy.import({
    _id: 1,
    territory_id: 1,
    territory_selector: { aom: ['217500016'] },
    start_date,
    end_date,
    name: 'Policy',
    handler: Idfm.id,
    status: 'active',
  });

  const cursor = t.context.repository.findTripByPolicy(policy, start_date, end_date);
  const { value } = await cursor.next();
  await cursor.next();
  t.true(Array.isArray(value));
  t.deepEqual(
    (value || [])
      .map((c) => ({
        start: c.start,
        end: c.end,
        operator_siret: c.operator_siret,
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
      operator_siret: '89248032800012',
      datetime: new Date('2022-06-15'),
      distance: 10000,
      duration: 900,
    },
  );
});

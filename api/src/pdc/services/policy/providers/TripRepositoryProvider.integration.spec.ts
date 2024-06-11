<<<<<<< HEAD
import { DbContext, makeDbBeforeAfter } from "@/pdc/providers/test/index.ts";
import { PolicyStatusEnum } from "@/shared/policy/common/interfaces/PolicyInterface.ts";
import {
  afterAll,
  afterEach,
  assert,
  assertEquals,
  assertFalse,
  assertObjectMatch,
  assertThrows,
  beforeAll,
  beforeEach,
  describe,
  it,
} from "@/dev_deps.ts";
import { Policy } from "../engine/entities/Policy.ts";
import { Idfm } from "../engine/policies/Idfm.ts";
import { TripRepositoryProvider } from "./TripRepositoryProvider.ts";
=======
import { DbContext, makeDbBeforeAfter } from '@pdc/providers/test';
import { PolicyStatusEnum } from '@shared/policy/common/interfaces/PolicyInterface';
import anyTest, { TestFn } from 'ava';
import { Policy } from '../engine/entities/Policy';
import { IDFMPeriodeNormale2021 } from '../engine/policies/20210520_IDFM';
import { TripRepositoryProvider } from './TripRepositoryProvider';
>>>>>>> 2b738c433 (refacto campagnes (#2504))

interface TestContext {
  db: DbContext;
  repository: TripRepositoryProvider;
}

const test = anyTest as TestFn<TestContext>;
const { before, after } = makeDbBeforeAfter();

beforeAll(async (t) => {
  const db = await before();
  t.context.db = db;
  t.context.repository = new TripRepositoryProvider(t.context.db.connection);
});

test.after.always(async (t) => {
  await after(t.context.db);
});

it("Should find carpools even with fraudcheck_error", async (t) => {
  const start_date = new Date("2024-03-01");
  const end_date = new Date("2024-03-30");

  const policy = await Policy.import({
    _id: 1,
    territory_id: 1,
    territory_selector: { aom: ["217500016"] },
    start_date,
    end_date,
<<<<<<< HEAD
    tz: "Europe/Paris",
    name: "Policy",
    handler: Idfm.id,
=======
    tz: 'Europe/Paris',
    name: 'Policy',
    handler: IDFMPeriodeNormale2021.id,
>>>>>>> 2b738c433 (refacto campagnes (#2504))
    status: PolicyStatusEnum.ACTIVE,
    incentive_sum: 5000,
    max_amount: 10_000_000_00,
  });

  const cursor = t.context.repository.findTripByPolicy(
    policy,
    start_date,
    end_date,
  );
  const { value } = await cursor.next(); // ok carpool
  await cursor.next(); // ok carpool
  await cursor.next(); // fraudcheck_error carpool
  assertEquals((value || []).length, 3);
  assert(Array.isArray(value));
  assertObjectMatch(
    (value || [])
      .map((c) => ({
        start: c.start,
        end: c.end,
        operator_uuid: c.operator_uuid,
        datetime: c.datetime,
        distance: c.distance,
      }))
      .shift(),
    {
      start: {
        aom: "217500016",
        arr: "91471",
        com: "91471",
        country: "XXXXX",
        dep: "91",
        epci: "200056232",
        reg: "11",
        reseau: 232,
      },
      end: {
        aom: "217500016",
        arr: "91377",
        com: "91377",
        country: "XXXXX",
        dep: "91",
        epci: "200056232",
        reg: "11",
        reseau: 232,
      },
      operator_uuid: "25a8774f-8708-4cf7-8527-446106b64a35",
      datetime: new Date("2024-03-15"),
      distance: 10000,
    },
  );
});

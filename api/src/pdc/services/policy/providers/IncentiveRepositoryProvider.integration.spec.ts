import {
  afterAll,
  assert,
  assertEquals,
  beforeAll,
  describe,
  it,
} from "@/dev_deps.ts";
import { DbContext, makeDbBeforeAfter } from "@/pdc/providers/test/index.ts";

import {
  IncentiveStateEnum,
  IncentiveStatusEnum,
} from "../interfaces/index.ts";
import { IncentiveRepositoryProvider } from "./IncentiveRepositoryProvider.ts";

describe("IncentiveRepositoryProvider", () => {
  let db: DbContext;
  let repository: IncentiveRepositoryProvider | undefined;
  const { before, after } = makeDbBeforeAfter();
  beforeAll(async () => {
    db = await before();
    repository = new IncentiveRepositoryProvider(
      db.connection,
    );
  });
  afterAll(async () => {
    repository = undefined;
    await after(db);
  });

  it("Should create many incentives", async () => {
    const incentives = [
      {
        _id: undefined,
        policy_id: 0,
        operator_id: 1,
        operator_journey_id: "operator_journey_id-1",
        datetime: new Date("2024-03-15"),
        statelessAmount: 0,
        statefulAmount: 0,
        status: IncentiveStatusEnum.Draft,
        state: IncentiveStateEnum.Regular,
        meta: [],
      },

      // same operator_id / operator_journey_id
      // -> should update the existing incentive
      {
        _id: undefined,
        policy_id: 0,
        operator_id: 1,
        operator_journey_id: "operator_journey_id-1",
        datetime: new Date("2024-03-15"),
        statelessAmount: 100,
        statefulAmount: 100,
        status: IncentiveStatusEnum.Draft,
        state: IncentiveStateEnum.Regular,
        meta: [],
      },
      {
        _id: undefined,
        policy_id: 0,
        operator_id: 1,
        operator_journey_id: "operator_journey_id-2",
        datetime: new Date("2024-03-16"),
        statelessAmount: 200,
        statefulAmount: 200,
        status: IncentiveStatusEnum.Draft,
        state: IncentiveStateEnum.Regular,
        meta: [
          {
            uuid: "uuid",
            key: "key",
          },
        ],
      },
    ];

    await repository?.createOrUpdateMany(incentives);

    const incentiveResults = await db.connection.getClient().query({
      text: `SELECT * FROM ${repository?.incentivesTable} WHERE policy_id = $1`,
      values: [0],
    });
    assertEquals(incentiveResults.rowCount, 2);
    assertEquals(
      incentiveResults.rows.find((i) =>
        i.operator_journey_id === "operator_journey_id-1"
      ).result,
      100,
    );
    assertEquals(
      incentiveResults.rows.find((i) =>
        i.operator_journey_id === "operator_journey_id-2"
      ).result,
      200,
    );
  });

  it("Should update many incentives", async () => {
    const incentives = [
      // update
      {
        _id: undefined,
        policy_id: 0,
        operator_id: 1,
        operator_journey_id: "operator_journey_id-1",
        datetime: new Date("2024-03-15"),
        statelessAmount: 0,
        statefulAmount: 0,
        status: IncentiveStatusEnum.Draft,
        state: IncentiveStateEnum.Regular,
        meta: [
          {
            uuid: "uuid",
            key: "key",
          },
        ],
      },

      // update
      {
        _id: undefined,
        policy_id: 0,
        operator_id: 1,
        operator_journey_id: "operator_journey_id-2",
        datetime: new Date("2024-03-16"),
        statelessAmount: 500,
        statefulAmount: 500,
        status: IncentiveStatusEnum.Draft,
        state: IncentiveStateEnum.Regular,
        meta: [],
      },

      // create
      {
        _id: undefined,
        policy_id: 0,
        operator_id: 1,
        operator_journey_id: "operator_journey_id-3",
        datetime: new Date("2024-03-16"),
        statelessAmount: 100,
        statefulAmount: 100,
        status: IncentiveStatusEnum.Draft,
        state: IncentiveStateEnum.Regular,
        meta: [],
      },
    ];

    await repository?.createOrUpdateMany(incentives);

    const incentiveResults = await db.connection.getClient().query({
      text: `SELECT * FROM ${repository?.incentivesTable} WHERE policy_id = $1`,
      values: [0],
    });

    assertEquals(incentiveResults.rowCount, 3);
    assertEquals(
      incentiveResults.rows.find((i) =>
        i.operator_journey_id === "operator_journey_id-1"
      ).result,
      0,
    );
    assertEquals(
      incentiveResults.rows.find((i) =>
        i.operator_journey_id === "operator_journey_id-1"
      ).state,
      "null",
    );
    assertEquals(
      incentiveResults.rows.find((i) =>
        i.operator_journey_id === "operator_journey_id-2"
      ).result,
      500,
    );
    assertEquals(
      incentiveResults.rows.find((i) =>
        i.operator_journey_id === "operator_journey_id-3"
      ).result,
      100,
    );
  });

  it("Should update many incentives amount", async () => {
    const incentives = await db.connection.getClient().query({
      text: `SELECT * FROM ${repository?.incentivesTable} WHERE policy_id = $1`,
      values: [0],
    });

    const data = incentives.rows.map((i) => ({ ...i, statefulAmount: 0 }));
    await repository?.updateStatefulAmount(data as any);

    const incentiveResults = await db.connection.getClient().query({
      text: `SELECT * FROM ${repository?.incentivesTable} WHERE policy_id = $1`,
      values: [0],
    });

    assertEquals(incentiveResults.rowCount, 3);
    assertEquals(
      incentiveResults.rows.filter((i) => i.state === "null").length,
      3,
    );
  });

  // FIXME
  // Leak on cursor
  it.skip("Should list draft incentive", async () => {
    const cursor = repository?.findDraftIncentive(new Date());
    const { value } = await cursor?.next() || {};
    await cursor?.next();
    assert(Array.isArray(value));
    const incentives = (Array.isArray(value) ? value : []).map((v) => ({
      operator_id: v.operator_id,
      operator_journey_id: v.operator_journey_id,
      statefulAmount: v.statefulAmount,
      statelessAmount: v.statelessAmount,
    }));
    assertEquals(incentives, [
      {
        operator_id: 1,
        operator_journey_id: "operator_journey_id-1",
        statefulAmount: 0,
        statelessAmount: 0,
      },
      {
        operator_id: 1,
        operator_journey_id: "operator_journey_id-2",
        statefulAmount: 0,
        statelessAmount: 500,
      },
      {
        operator_id: 1,
        operator_journey_id: "operator_journey_id-3",
        statefulAmount: 0,
        statelessAmount: 100,
      },
    ]);
  });
});

import { date } from "@/deps.ts";
import {
  afterAll,
  assert,
  assertEquals,
  assertObjectMatch,
  assertRejects,
  beforeAll,
  describe,
  it,
} from "@/dev_deps.ts";
import { NotFoundException } from "@/ilos/common/index.ts";
import { Carpool } from "@/pdc/providers/seed/carpools.ts";
import { DbContext, makeDbBeforeAfter } from "@/pdc/providers/test/index.ts";
import { StatusEnum } from "@/shared/acquisition/status.contract.ts";
import {
  AcquisitionCreateInterface,
  AcquisitionErrorStageEnum,
  AcquisitionStatusEnum,
} from "../interfaces/AcquisitionRepositoryProviderInterface.ts";
import { AcquisitionRepositoryProvider } from "./AcquisitionRepositoryProvider.ts";

describe("AcquisitionRepositoryProvider", () => {
  let repository: AcquisitionRepositoryProvider;
  let operator_id: number;
  let db: DbContext;

  const { before, after } = makeDbBeforeAfter();

  beforeAll(async () => {
    operator_id = 1;
    db = await before();
    repository = new AcquisitionRepositoryProvider(
      db.connection,
    );
  });

  afterAll(async () => {
    await after(db);
  });

  function createPayload(
    data: Partial<AcquisitionCreateInterface>,
  ): AcquisitionCreateInterface {
    return {
      operator_id: 1,
      operator_journey_id: "one",
      application_id: 1,
      api_version: 1,
      request_id: "my request id",
      payload: {
        test: "12345",
      },
      ...data,
    };
  }

  const statusError = new Error("message");
  const errors = [
    statusError.message,
    statusError.message,
    statusError.message,
  ];

  const updateAcquistionJourneyIdOk = async (
    journey_id: string,
  ): Promise<{ _id: number; journey_id: number }> => {
    const result = await db.connection.getClient().query<any>({
      text: `
      UPDATE ${repository.table}
      SET status = 'ok'
      WHERE operator_id = $1 AND journey_id = $2
      RETURNING _id, journey_id;
    `,
      values: [operator_id, journey_id],
    });
    return result.rows[0];
  };

  const insertCarpoolWithStatus = async (
    acquisition: { _id: number; journey_id: number },
    status: "fraudcheck_error" | "anomaly_error" | "ok",
  ): Promise<Carpool & { _id: number }> => {
    const result = await db.connection.getClient().query<any>({
      text: `
    INSERT INTO carpool.carpools(
      acquisition_id, operator_id, trip_id, operator_trip_id, is_driver, 
      operator_class, datetime, duration, distance, seats, 
      identity_id, operator_journey_id, cost, status, 
      start_geo_code, end_geo_code)
      VALUES ($1, $2, $3, $4, $5, 
        $6, $7, $8, $9, $10, 
        $11, $12, $13, $14, $15, 
        $16)
      RETURNING _id, operator_journey_id;
    `,
      values: [
        acquisition._id,
        operator_id,
        "trip_id_5",
        "operator_trip_id_5",
        true,
        "C",
        new Date(),
        2500,
        25000,
        1,
        4,
        acquisition.journey_id,
        0,
        status,
        "91471",
        "91471",
      ],
    });

    return result.rows[0];
  };
  it("Should create acquisition", async () => {
    const data = [
      { operator_journey_id: "1" }, // pending -> pending (updated) -> acquisition_error
      { operator_journey_id: "2" }, // pending -> ok
      { operator_journey_id: "3" }, // pending -> ok
      { operator_journey_id: "4" }, // pending -> ok
      { operator_journey_id: "5" }, // pending -> fraudcheck_error
    ].map(createPayload);

    const acqs = await repository.createOrUpdateMany(data);
    assertEquals(acqs.map((v) => v.operator_journey_id).sort(), [
      "1",
      "2",
      "3",
      "4",
      "5",
    ]);

    const result = await db.connection.getClient().query<any>({
      text: `
      SELECT
        operator_id,
        journey_id as operator_journey_id,
        application_id, api_version,
        request_id,
        payload,
        status,
        try_count
      FROM ${repository.table}
      WHERE operator_id = $1
      AND request_id IS NOT NULL
    `,
      values: [operator_id],
    });

    assertEquals(result.rowCount, data.length);
    assertEquals(
      result.rows,
      data.map((d) => ({ ...d, status: "pending", try_count: 0 })),
    );
  });

  it("Should update acquisition", async () => {
    await db.connection.getClient().query<any>({
      text: `
      UPDATE ${repository.table}
      SET status = 'ok', try_count = 50
      WHERE operator_id = $1 AND journey_id = $2
    `,
      values: [operator_id, "2"],
    });
    const initialData = [{ operator_journey_id: "3" }, {
      operator_journey_id: "4",
    }, { operator_journey_id: "5" }].map(
      createPayload,
    );
    const data = [
      { operator_journey_id: "1", request_id: "other request id" },
      { operator_journey_id: "2", request_id: "other request id" },
    ].map(createPayload);

    // 2 is not update because 'ok' status
    const acqs = await repository.createOrUpdateMany(data);
    assertEquals(
      acqs.map((v) => v.operator_journey_id),
      ["1"],
    );

    const result = await db.connection.getClient().query<any>({
      text: `
      SELECT
        operator_id,
        journey_id as operator_journey_id,
        application_id,
        api_version,
        request_id,
        payload,
        status,
        try_count
      FROM ${repository.table}
      WHERE operator_id = $1
      AND request_id IS NOT NULL
      ORDER BY journey_id
    `,
      values: [operator_id],
    });

    assertEquals(result.rowCount, 5);
    assertEquals(
      result.rows,
      [...data, ...initialData].map((d) => {
        if (d.operator_journey_id !== "2") {
          return { ...d, status: "pending", try_count: 0 };
        }
        return {
          ...d,
          request_id: "my request id",
          status: "ok",
          try_count: 50,
        };
      }),
    );
  });

  it("Should update status", async () => {
    const { rows: data } = await db.connection.getClient().query<
      { _id: number }
    >({
      text:
        `SELECT _id FROM ${repository.table} WHERE operator_id = $1 AND journey_id = $2`,
      values: [operator_id, "1"],
    });

    await repository.updateManyStatus([
      {
        acquisition_id: data[0]._id,
        status: AcquisitionStatusEnum.Error,
        error_stage: AcquisitionErrorStageEnum.Acquisition,
        errors: [statusError.message],
      },
    ]);
    const result = await db.connection.getClient().query<any>({
      text: `
      SELECT
        operator_id,
        journey_id as operator_journey_id,
        status,
        error_stage,
        errors,
        try_count
      FROM ${repository.table}
      WHERE operator_id = $1
      AND request_id IS NOT NULL
      ORDER BY journey_id
    `,
      values: [operator_id],
    });

    assertEquals(result.rowCount, 5);
    assertEquals(result.rows, [
      {
        operator_id: 1,
        operator_journey_id: "1",
        status: "error",
        error_stage: "acquisition",
        errors: [statusError.message],
        try_count: 1,
      },
      {
        operator_id: 1,
        operator_journey_id: "2",
        status: "ok",
        error_stage: null,
        errors: [],
        try_count: 50,
      },
      {
        operator_id: 1,
        operator_journey_id: "3",
        status: "pending",
        error_stage: null,
        errors: [],
        try_count: 0,
      },
      {
        operator_id: 1,
        operator_journey_id: "4",
        status: "pending",
        error_stage: null,
        errors: [],
        try_count: 0,
      },
      {
        operator_id: 1,
        operator_journey_id: "5",
        status: "pending",
        error_stage: null,
        errors: [],
        try_count: 0,
      },
    ]);

    await repository.updateManyStatus([
      {
        acquisition_id: data[0]._id,
        status: AcquisitionStatusEnum.Error,
        error_stage: AcquisitionErrorStageEnum.Acquisition,
        errors: [statusError.message, statusError.message],
      },
    ]);
    const result2 = await db.connection.getClient().query<any>({
      text: `
      SELECT
        operator_id,
        journey_id as operator_journey_id,
        status,
        error_stage,
        errors,
        try_count
      FROM ${repository.table}
      WHERE _id = $1
    `,
      values: [data[0]._id],
    });
    assertEquals(result2.rows, [
      {
        errors,
        operator_id: 1,
        operator_journey_id: "1",
        status: "error",
        error_stage: "acquisition",
        try_count: 2,
      },
    ]);
  });

  it("Should get status by operator_id and operator_journey_id", async () => {
    const r = await repository.getStatus(operator_id, "1");
    const { operator_journey_id, status, fraud_error_labels } = r || {};

    assertObjectMatch(
      { operator_journey_id, status, fraud_error_labels },
      {
        operator_journey_id: "1",
        status: StatusEnum.AcquisitionError,
        fraud_error_labels: [],
      },
    );
  });

  it("Should get fraudcheck status and labels for carpool", async () => {
    // Arrange
    const acquisition_row = await updateAcquistionJourneyIdOk("5");
    const { _id: carpool_id } = await insertCarpoolWithStatus(
      acquisition_row,
      "fraudcheck_error",
    );
    await db.connection.getClient().query<any>({
      text: `
    INSERT INTO fraudcheck.labels(
      carpool_id, label, geo_code)
      VALUES ($1, $2, $3);
    `,
      values: [carpool_id, "interoperator_fraud", "76"],
    });

    // Act
    const r = await repository.getStatus(
      operator_id,
      "5",
    );
    const { status, fraud_error_labels } = r || {};

    // Assert
    assertEquals(status, StatusEnum.FraudError);
    assertEquals(fraud_error_labels, ["interoperator_fraud"]);
  });

  it("Should find with date selectors", async () => {
    const [result, , commit] = await repository.findThenUpdate({
      limit: 2,
      status: AcquisitionStatusEnum.Pending,
      from: new Date(),
    });

    assertEquals(result, []);
    await commit();
  });

  it("Should find then update with selectors", async () => {
    const [result, , commit] = await repository.findThenUpdate({
      limit: 2,
      status: AcquisitionStatusEnum.Pending,
      to: new Date(),
    });

    assertEquals(
      result.map(({ created_at, ...r }) => r),
      [
        {
          _id: 6,
          payload: { test: "12345" },
          api_version: 1,
          operator_id: operator_id,
        },
        {
          _id: 7,
          payload: { test: "12345" },
          api_version: 1,
          operator_id: operator_id,
        },
      ],
    );

    await commit();
  });

  it("Should find and update with lock", async () => {
    const [result1, , commit1] = await repository.findThenUpdate({
      limit: 1,
      status: AcquisitionStatusEnum.Pending,
    });

    assertEquals(
      result1.map(({ created_at, ...r }) => r),
      [{
        _id: 6,
        payload: { test: "12345" },
        api_version: 1,
        operator_id: operator_id,
      }],
    );

    const [result2, update2, commit2] = await repository.findThenUpdate(
      {
        limit: 1,
        status: AcquisitionStatusEnum.Pending,
      },
    );

    assertEquals(
      result2.map(({ created_at, ...r }) => r),
      [{
        _id: 7,
        payload: { test: "12345" },
        api_version: 1,
        operator_id: operator_id,
      }],
    );

    await commit1(); // release lock 1
    const [result3, , commit3] = await repository.findThenUpdate({
      limit: 1,
      status: AcquisitionStatusEnum.Pending,
    });

    assertEquals(
      result3.map(({ created_at, ...r }) => r),
      [{
        _id: 6,
        payload: { test: "12345" },
        api_version: 1,
        operator_id: operator_id,
      }],
    );
    await update2({ acquisition_id: 7, status: AcquisitionStatusEnum.Ok }); // <-- error
    await update2({ acquisition_id: 8, status: AcquisitionStatusEnum.Ok });
    await commit2();
    // release lock 2

    const [result4, , commit4] = await repository.findThenUpdate({
      limit: 1,
      status: AcquisitionStatusEnum.Pending,
    });

    assertEquals(result4, []);
    await commit3(); // release lock 3
    await commit4(); // release lock 3
  });

  it("Should find with lock timeout", async () => {
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    await db.connection.getClient().query<any>({
      text:
        `UPDATE ${repository.table} SET status = 'pending' WHERE operator_id = $1 AND status <> 'error'`,
      values: [operator_id],
    });

    const [result1, , commit1] = await repository.findThenUpdate({
      limit: 1,
      status: AcquisitionStatusEnum.Pending,
    });

    assertEquals(
      result1.map(({ created_at, ...r }) => r),
      [{
        _id: 1,
        payload: {},
        api_version: 2,
        operator_id: operator_id,
      }],
    );

    // do the job of the timeout releasing the lock
    // since the timeout has been moved to ProcessJourneyAction,
    // we cannot test it within the AcquisitionRepositoryProvider
    setTimeout(async () => await commit1(), 1000);

    // wait a bit longer and make sure we get the same record from db
    // as it has been unlocked
    // If the record is still locked, we should get _id: 2
    await delay(1500);

    const [result2, , commit2] = await repository.findThenUpdate({
      limit: 1,
      status: AcquisitionStatusEnum.Pending,
    });

    assertEquals(
      result2.map(({ created_at, ...r }) => r),
      [{
        _id: 1,
        payload: {},
        api_version: 2,
        operator_id: operator_id,
      }],
    );

    await commit2(); // release lock 2
  });

  // FIXME
  // Les callbacks ne sont pas exec dans le scope du catch
  // Les erreurs ne sont pas captées et le ROLLBACK
  // ne doit pas fonctionner avec le code actuel
  it("Should partial rollback if update error", async () => {
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    const [result1, update1, commit1] = await repository.findThenUpdate(
      {
        limit: 2,
        status: AcquisitionStatusEnum.Pending,
      },
    );
    await update1({
      acquisition_id: result1[0]._id,
      status: AcquisitionStatusEnum.Ok,
    });
    await update1({
      acquisition_id: result1[1]._id,
      status: "status_not_existing" as AcquisitionStatusEnum,
    });

    // see above why we mock the timeout
    setTimeout(async () => await commit1(), 1000);
    await delay(1500);

    const { rows: data } = await db.connection.getClient().query<
      { _id: number; status: AcquisitionStatusEnum }
    >({
      text:
        `SELECT _id, status FROM ${repository.table} WHERE _id = ANY($1::int[]) ORDER BY _id`,
      values: [result1.map((r) => r._id)],
    });

    assertEquals(data, [
      {
        _id: result1[0]._id,
        status: AcquisitionStatusEnum.Ok,
      },
      {
        _id: result1[1]._id,
        status: AcquisitionStatusEnum.Pending,
      },
    ]);
  });

  it("Should list acquisition status", async () => {
    const search = {
      operator_id: 1,
      status: StatusEnum.Pending,
      start: date.subDays(new Date(), 7),
      end: new Date(),
      offset: 0,
      limit: 3,
    };

    const result = await repository.list(search);
    assertEquals(result, [
      { operator_journey_id: "5" },
      { operator_journey_id: "4" },
      { operator_journey_id: "2" },
    ]);

    const result1 = await repository.list({
      ...search,
      status: StatusEnum.AcquisitionError,
    });
    assertEquals(result1, [{ operator_journey_id: "1" }]);

    const result2 = await repository.list({
      ...search,
      status: StatusEnum.Ok,
    });
    assertEquals(result2, [
      { operator_journey_id: "operator_journey_id-2" },
      { operator_journey_id: "operator_journey_id-1" },
    ]);
  });

  it("Should cancel acquisition", async () => {
    await repository.cancel(1, "3");
    await repository.cancel(1, "4", "CODE1", "TOTO");
    const result = await db.connection.getClient().query<any>({
      text: `SELECT
      journey_id as operator_journey_id, cancel_code, cancel_message
    FROM ${repository.table}
    WHERE operator_id = $1 AND status = 'canceled'
    ORDER BY operator_journey_id`,
      values: [1],
    });
    assertEquals(result.rows, [
      {
        operator_journey_id: "3",
        cancel_code: null,
        cancel_message: null,
      },
      {
        operator_journey_id: "4",
        cancel_code: "CODE1",
        cancel_message: "TOTO",
      },
    ]);
  });

  it("Should throw not found if trying to path unexisting acquistion", async () => {
    const error1 = await assertRejects(
      async () =>
        await repository.patchPayload({
          operator_id: null as any,
          operator_journey_id: undefined as any,
          status: [],
        }, {}),
    );
    assert(error1 instanceof NotFoundException);

    const error2 = await assertRejects(
      async () =>
        await repository.patchPayload(
          {
            operator_id: 1,
            operator_journey_id: "4",
            status: [AcquisitionStatusEnum.Ok],
          },
          {},
        ),
    );
    assert(error2 instanceof NotFoundException);
  });

  it("Should patch payload", async () => {
    await repository.patchPayload(
      {
        operator_id: 1,
        operator_journey_id: "1",
        status: [AcquisitionStatusEnum.Error, AcquisitionStatusEnum.Pending],
      },
      { test2: true },
    );
    const result = await db.connection.getClient().query<any>({
      text: `SELECT payload
    FROM ${repository.table}
    WHERE operator_id = $1 AND journey_id = $2
    `,
      values: [1, "1"],
    });
    assertObjectMatch(result.rows[0], {
      payload: {
        test: "12345",
        test2: true,
      },
    });
  });

  it("Should create new acquisition and get anomaly error with temporal overlap label", async () => {
    // Arrange
    const data = [{ operator_journey_id: "6" }, { operator_journey_id: "7" }]
      .map(
        createPayload,
      );

    await repository.createOrUpdateMany(data);

    // acquisition should be processed and ok
    const acquisition_row_6 = await updateAcquistionJourneyIdOk("6");
    const acquisition_row_7 = await updateAcquistionJourneyIdOk("7");

    // first is ok is ok second is conflicting
    const { _id: carpool_id_6, operator_journey_id: operator_journey_id_6 } =
      await insertCarpoolWithStatus(
        acquisition_row_6,
        "ok",
      );
    const { _id: carpool_id_7 } = await insertCarpoolWithStatus(
      acquisition_row_7,
      "anomaly_error",
    );

    // add anomaly label for carpool_id 7
    await db.connection.getClient().query<any>({
      text: `
    INSERT INTO anomaly.labels(
      carpool_id, label, conflicting_carpool_id, conflicting_operator_journey_id, overlap_duration_ratio)
      VALUES ($1, $2, $3, $4, $5);
    `,
      values: [
        carpool_id_7,
        "temporal_overlap_anomaly",
        carpool_id_6,
        operator_journey_id_6,
        0.845,
      ],
    });

    // Act
    const r = await repository
      .getStatus(operator_id, "7");
    const { status, anomaly_error_details } = r || {};
    const details = anomaly_error_details?.pop();

    // Assert
    assertEquals(status, StatusEnum.AnomalyError);
    assertEquals(
      details?.label,
      "temporal_overlap_anomaly",
    );
    assertEquals(
      details?.metas.conflicting_journey_id,
      operator_journey_id_6,
    );
    assertEquals(
      details?.metas.temporal_overlap_duration_ratio,
      0.845,
    );
  });
});

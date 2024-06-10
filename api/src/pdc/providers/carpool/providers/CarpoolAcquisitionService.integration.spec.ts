import {
  afterAll,
  afterEach,
  assert,
  assertEquals,
  assertObjectMatch,
  assertRejects,
  beforeAll,
  beforeEach,
  describe,
  it,
  sinon as Sinon,
  SinonSandbox,
} from "@/dev_deps.ts";
import { GeoProvider } from "@/pdc/providers/geo/index.ts";
import { DbContext, makeDbBeforeAfter } from "@/pdc/providers/test/index.ts";
import sql, { raw } from "../helpers/sql.ts";
import {
  insertableCarpool,
  updatableCarpool,
} from "../mocks/database/carpool.ts";
import { CarpoolGeoRepository } from "../repositories/CarpoolGeoRepository.ts";
import { CarpoolLookupRepository } from "../repositories/CarpoolLookupRepository.ts";
import { CarpoolRepository } from "../repositories/CarpoolRepository.ts";
import { CarpoolRequestRepository } from "../repositories/CarpoolRequestRepository.ts";
import { CarpoolStatusRepository } from "../repositories/CarpoolStatusRepository.ts";
import { CarpoolAcquisitionService } from "./CarpoolAcquisitionService.ts";

describe("CarpoolAcquistionService", () => {
  let carpoolRepository: CarpoolRepository;
  let statusRepository: CarpoolStatusRepository;
  let requestRepository: CarpoolRequestRepository;
  let lookupRepository: CarpoolLookupRepository;
  let geoRepository: CarpoolGeoRepository;
  let geoService: GeoProvider;
  let db: DbContext;
  let sinon: SinonSandbox;

  const { before, after } = makeDbBeforeAfter();
  beforeAll(async () => {
    db = await before();
    geoService = Sinon.createStubInstance(GeoProvider);
    carpoolRepository = new CarpoolRepository(db.connection);
    statusRepository = new CarpoolStatusRepository(db.connection);
    requestRepository = new CarpoolRequestRepository(db.connection);
    lookupRepository = new CarpoolLookupRepository(db.connection);
    geoRepository = new CarpoolGeoRepository(db.connection);
  });

  afterAll(async () => {
    await after(db);
  });

  beforeEach(() => {
    sinon = Sinon.createSandbox();
  });
  afterEach(() => {
    sinon.restore();
  });
  function getService(
    overrides: any,
  ): CarpoolAcquisitionService {
    return new CarpoolAcquisitionService(
      db.connection,
      overrides.statusRepository ?? statusRepository,
      overrides.requestRepository ?? requestRepository,
      overrides.lookupRepository ?? lookupRepository,
      overrides.carpoolRepository ?? carpoolRepository,
      overrides.geoRepository ?? geoRepository,
      geoService,
    );
  }
  it("Should create carpool", async () => {
    const carpoolRepositoryL = sinon.spy(carpoolRepository);
    const requestRepositoryL = sinon.spy(requestRepository);
    const statusRepositoryL = sinon.spy(statusRepository);

    const service = getService({
      carpoolRepository: carpoolRepositoryL,
      requestRepository: requestRepositoryL,
      statusRepository: statusRepositoryL,
    });

    const data = { ...insertableCarpool };
    await service.registerRequest({ ...data, api_version: 3 });

    // t.log(carpoolRepository.register.getCalls());
    assert(carpoolRepositoryL.register.calledOnce);
    // t.log(requestRepository.save.getCalls());
    assert(requestRepositoryL.save.calledOnce);
    // t.log(statusRepository.saveAcquisitionStatus.getCalls());
    assert(statusRepositoryL.saveAcquisitionStatus.calledOnce);

    const r = await lookupRepository.findOne(
      data.operator_id,
      data.operator_journey_id,
    );
    const { _id, uuid, created_at, updated_at, ...carpool } = r || {};
    assertObjectMatch(carpool, {
      ...data,
      fraud_status: "pending",
      acquisition_status: "received",
    });
  });

  it("Should update carpool", async () => {
    const carpoolRepositoryL = sinon.spy(carpoolRepository);
    const requestRepositoryL = sinon.spy(requestRepository);
    const statusRepositoryL = sinon.spy(statusRepository);

    const service = getService({
      carpoolRepository: carpoolRepositoryL,
      requestRepository: requestRepositoryL,
      statusRepository: statusRepositoryL,
    });

    const data = { ...updatableCarpool };
    await service.updateRequest({
      ...data,
      api_version: 3,
      operator_id: insertableCarpool.operator_id,
      operator_journey_id: insertableCarpool.operator_journey_id,
    });

    // t.log(carpoolRepository.update.getCalls());
    assert(carpoolRepositoryL.update.calledOnce);
    // t.log(requestRepository.save.getCalls());
    assert(requestRepositoryL.save.calledOnce);
    // t.log(statusRepository.saveAcquisitionStatus.getCalls());
    assert(statusRepositoryL.saveAcquisitionStatus.calledOnce);

    const r = await lookupRepository.findOne(
      insertableCarpool.operator_id,
      insertableCarpool.operator_journey_id,
    );
    const { _id, uuid, created_at, updated_at, ...carpool } = r || {};
    assertObjectMatch(carpool, {
      ...insertableCarpool,
      ...updatableCarpool,
      fraud_status: "pending",
      acquisition_status: "updated",
    });
  });

  it("Should cancel carpool", async (t) => {
    const lookupRepositoryL = sinon.spy(lookupRepository);
    const requestRepositoryL = sinon.spy(requestRepository);
    const statusRepositoryL = sinon.spy(statusRepository);

    const service = getService({
      lookupRepository: lookupRepositoryL,
      requestRepository: requestRepositoryL,
      statusRepository: statusRepositoryL,
    });

    const data = {
      cancel_code: "FRAUD",
      cancel_message: "Got u",
      api_version: 3,
      operator_id: insertableCarpool.operator_id,
      operator_journey_id: insertableCarpool.operator_journey_id,
    };
    await service.cancelRequest(data);

    // t.log(lookupRepository.findOneStatus.getCalls());
    assert(lookupRepositoryL.findOneStatus.calledOnce);
    // t.log(requestRepository.save.getCalls());
    assert(requestRepositoryL.save.calledOnce);
    // t.log(statusRepository.saveAcquisitionStatus.getCalls());
    assert(statusRepositoryL.saveAcquisitionStatus.calledOnce);

    const r = lookupRepository.findOne(
      insertableCarpool.operator_id,
      insertableCarpool.operator_journey_id,
    );
    const { _id, uuid, created_at, updated_at, ...carpool } = await r || {};
    assertObjectMatch(carpool, {
      ...insertableCarpool,
      ...updatableCarpool,
      fraud_status: "pending",
      acquisition_status: "canceled",
    });
  });

  it("Should rollback if something fail", async () => {
    const carpoolRepositoryL = sinon.spy(carpoolRepository);
    const requestRepositoryL = sinon.spy(requestRepository);
    sinon.replace(
      statusRepository,
      "saveAcquisitionStatus",
      sinon.fake.throws(new Error("DB")),
    );

    const service = getService({
      carpoolRepository: carpoolRepositoryL,
      requestRepository: requestRepositoryL,
    });

    const data = {
      ...insertableCarpool,
      operator_journey_id: "operator_journey_id_2",
    };
    await assertRejects(async () =>
      await service.registerRequest({ ...data, api_version: 3 })
    );

    assert(carpoolRepositoryL.register.calledOnce);
    assert(requestRepositoryL.save.calledOnce);

    const result = await db.connection
      .getClient()
      .query(
        sql`SELECT * FROM ${
          raw(carpoolRepository.table)
        } WHERE operator_id = ${data.operator_id} AND operator_journey_id = ${data.operator_journey_id}`,
      );
    assertEquals(result.rows, []);
  });
});

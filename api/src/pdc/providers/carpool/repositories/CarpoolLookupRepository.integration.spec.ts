import {
  afterAll,
  assertObjectMatch,
  beforeAll,
  describe,
  it,
} from "@/dev_deps.ts";
import { DbContext, makeDbBeforeAfter } from "@/pdc/providers/test/index.ts";
import { Id } from "../interfaces/index.ts";
import { insertableCarpool } from "../mocks/database/carpool.ts";
import { insertableAcquisitionStatus } from "../mocks/database/status.ts";
import { CarpoolLookupRepository } from "./CarpoolLookupRepository.ts";
import { CarpoolRepository } from "./CarpoolRepository.ts";
import { CarpoolStatusRepository } from "./CarpoolStatusRepository.ts";

describe("CarpoolGeoRepository", () => {
  let repository: CarpoolLookupRepository;
  let statusRepository: CarpoolStatusRepository;
  let carpoolRepository: CarpoolRepository;
  let db: DbContext;
  let carpool_id: Id;

  const { before, after } = makeDbBeforeAfter();
  beforeAll(async () => {
    db = await before();
    repository = new CarpoolLookupRepository(db.connection);
    statusRepository = new CarpoolStatusRepository(db.connection);
    carpoolRepository = new CarpoolRepository(db.connection);
    const carpool = await carpoolRepository.register(insertableCarpool);
    carpool_id = carpool._id;
    const statusData = {
      ...insertableAcquisitionStatus,
      carpool_id: carpool._id,
    };
    await statusRepository.saveAcquisitionStatus(statusData);
  });
  afterAll(async () => {
    await after(db);
  });

  it("Should get one carpool status", async (t) => {
    const data = { ...insertableCarpool };
    const r = await repository.findOneStatus(
      data.operator_id,
      data.operator_journey_id,
    );
    const { _id, acquisition_status, operator_trip_id } = r || {};
    assertObjectMatch(
      { _id, acquisition_status, operator_trip_id },
      {
        _id: carpool_id,
        acquisition_status: insertableAcquisitionStatus.status,
        operator_trip_id: data.operator_trip_id,
      },
    );
  });

  it("Should get one carpool", async (t) => {
    const data = { ...insertableCarpool };
    const r = await repository.findOne(
      data.operator_id,
      data.operator_journey_id,
    );
    const { _id, uuid, created_at, updated_at, ...carpool } = r || {};
    assertObjectMatch(carpool, {
      ...data,
      fraud_status: "pending",
      acquisition_status: "canceled",
    });
  });
});

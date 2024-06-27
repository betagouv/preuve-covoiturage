import { afterAll, assertEquals, beforeAll, describe, it } from "@/dev_deps.ts";
import { DbContext, makeDbBeforeAfter } from "@/pdc/providers/test/index.ts";
import sql, { raw } from "../helpers/sql.ts";
import { Id } from "../interfaces/index.ts";
import { insertableCarpool } from "../mocks/database/carpool.ts";
import { insertableAcquisitionStatus } from "../mocks/database/status.ts";
import { CarpoolRepository } from "./CarpoolRepository.ts";
import { CarpoolStatusRepository } from "./CarpoolStatusRepository.ts";

describe("CarpoolStatusRepository", () => {
  let repository: CarpoolStatusRepository;
  let carpoolRepository: CarpoolRepository;
  let db: DbContext;
  let carpool_id: Id;

  const { before, after } = makeDbBeforeAfter();

  beforeAll(async () => {
    db = await before();
    repository = new CarpoolStatusRepository(db.connection);
    carpoolRepository = new CarpoolRepository(db.connection);
    const carpool = await carpoolRepository.register(insertableCarpool);
    carpool_id = carpool._id;
  });

  afterAll(async () => {
    await after(db);
  });

  it("Should create acquisition status", async () => {
    const data = {
      ...insertableAcquisitionStatus,
      carpool_id: carpool_id,
    };

    await repository.saveAcquisitionStatus(data);
    const result = await db.connection.getClient().query(sql`
      SELECT * FROM ${raw(repository.table)}
      WHERE carpool_id = ${carpool_id}
    `);

    assertEquals(result.rows.pop()?.acquisition_status, data.status);
  });
});

import {
  afterAll,
  afterEach,
  assert,
  beforeAll,
  beforeEach,
  describe,
  it,
  sinon as Sinon,
  SinonSandbox,
} from "@/dev_deps.ts";
import { CarpoolStatusService } from "@/pdc/providers/carpool/providers/CarpoolStatusService.ts";
import { CarpoolLabelRepository } from "@/pdc/providers/carpool/repositories/CarpoolLabelRepository.ts";
import { CarpoolRepository } from "@/pdc/providers/carpool/repositories/CarpoolRepository.ts";
import { DbContext, makeDbBeforeAfter } from "@/pdc/providers/test/dbMacro.ts";
import { insertableCarpool } from "../mocks/database/carpool.ts";
import { CarpoolStatusRepository } from "../repositories/CarpoolStatusRepository.ts";

describe("CarpoolAcquisitionService", () => {
  let statusRepository: CarpoolStatusRepository;
  let labelRepository: CarpoolLabelRepository;
  let repository: CarpoolRepository;
  let sinon: SinonSandbox;

  let db: DbContext;

  const { before, after } = makeDbBeforeAfter();

  beforeAll(async () => {
    db = await before();
    statusRepository = new CarpoolStatusRepository(db.connection);
    labelRepository = new CarpoolLabelRepository(db.connection);
    repository = new CarpoolRepository(db.connection);
  });

  beforeEach(() => {
    sinon = Sinon.createSandbox();
  });

  afterAll(async () => {
    await after(db);
  });

  afterEach(() => {
    sinon.restore();
  });

  it("Should get carpool status for v3.2", async () => {
    // Arrange
    const statusRepositoryL = sinon.spy(statusRepository);
    const labelRepositoryL = sinon.spy(labelRepository);

    // statusRepositoryL.getStatusByOperatorJourneyId.returns({
    //   created_at: new Date("2024-01-01"),
    //   acquisition_status: CarpoolAcquisitionStatusEnum.Processed,
    //   anomaly_status: CarpoolAnomalyStatusEnum.Passed,
    //   fraud_status: CarpoolFraudStatusEnum.Passed,
    //   legacy_id: 5,
    // });

    const service = new CarpoolStatusService(
      db.connection,
      statusRepositoryL,
      labelRepositoryL,
    );

    const data = { ...insertableCarpool };
    await repository.register(data);

    // Act
    const result = await service.findByOperatorJourneyId(
      data.operator_id,
      data.operator_journey_id,
      "3.2",
    );

    console.log(JSON.stringify(result));

    // Assert
    assert(statusRepositoryL.getStatusByOperatorJourneyId.calledOnce);
    // assert(labelRepositoryL.findAnomalyByOperatorJourneyId.calledOnce);
    // assert(labelRepositoryL.findFraudByOperatorJourneyId.calledOnce);
    // assert(labelRepositoryL.findTermsByOperatorJourneyId.calledOnce);

    assert(!!result);
    assert(result.legacy_id != undefined);
  });
});

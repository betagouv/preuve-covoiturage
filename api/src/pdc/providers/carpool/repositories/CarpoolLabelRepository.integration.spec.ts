import { afterAll, assertEquals, beforeAll, describe, it } from "@/dev_deps.ts";
import sql, { raw } from "@/lib/pg/sql.ts";
import { DbContext, makeDbBeforeAfter } from "@/pdc/providers/test/index.ts";
import { insertableCarpool } from "../mocks/database/carpool.ts";
import { CarpoolLabelRepository } from "./CarpoolLabelRepository.ts";
import { CarpoolRepository } from "./CarpoolRepository.ts";

describe("Carpool Label Repository", () => {
  let repository: CarpoolRepository;
  let labelRepository: CarpoolLabelRepository;
  let db: DbContext;
  let carpool_id: number;
  const label = "test";
  const another_label = "another_test_label";

  const { before, after } = makeDbBeforeAfter();

  beforeAll(async () => {
    db = await before();
    repository = new CarpoolRepository(db.connection);
    labelRepository = new CarpoolLabelRepository(db.connection);
    const data = await repository.register(insertableCarpool);
    carpool_id = data._id;
    await db.connection.getClient().query(
      sql`INSERT INTO ${raw(labelRepository.anomalyTable)} (carpool_id, label) VALUES (${carpool_id}, ${label})`,
    );
    await db.connection.getClient().query(
      sql`INSERT INTO ${raw(labelRepository.fraudTable)} (carpool_id, label) VALUES (${carpool_id}, ${label})`,
    );
    await db.connection.getClient().query(
      sql`INSERT INTO ${raw(labelRepository.fraudTable)} (carpool_id, label) VALUES (${carpool_id},${another_label})`,
    );
    await db.connection.getClient().query(
      sql`INSERT INTO ${raw(labelRepository.termsTable)} (carpool_id, labels) VALUES (${carpool_id}, ${[label]})`,
    );
  });

  afterAll(async () => {
    await after(db);
  });

  it("Should read carpool anomaly label", async () => {
    const result = await labelRepository.findAnomalyByOperatorJourneyId(
      insertableCarpool.operator_id,
      insertableCarpool.operator_journey_id,
    );
    assertEquals(result, [{
      label,
      metas: {
        conflicting_operator_journey_id: null,
        overlap_duration_ratio: null,
      },
    }]);
  });

  it("Should read carpool fraud label and return single entry with 2 labels", async () => {
    const result = await labelRepository.findFraudByOperatorJourneyId(
      insertableCarpool.operator_id,
      insertableCarpool.operator_journey_id,
    );
    assertEquals(result, [{
      label: "interoperator_fraud",
    }]);
  });

  it("Should read carpool fraud label and return empty array if none", async () => {
    // Arrange
    await repository.register({ ...insertableCarpool, operator_journey_id: "operator_journey_id-4" });

    // Act
    const result = await labelRepository.findFraudByOperatorJourneyId(
      insertableCarpool.operator_id,
      "operator_journey_id-4",
    );

    // Assert
    assertEquals(result, []);
  });

  it("Should read carpool terms label", async () => {
    const result = await labelRepository.findTermsByOperatorJourneyId(
      insertableCarpool.operator_id,
      insertableCarpool.operator_journey_id,
    );
    assertEquals(result, [{
      label,
    }]);
  });
});

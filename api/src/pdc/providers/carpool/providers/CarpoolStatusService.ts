import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";
import { CarpoolLabelRepository } from "../repositories/CarpoolLabelRepository.ts";
import { CarpoolStatusRepository } from "../repositories/CarpoolStatusRepository.ts";

// TODO : test
export class CarpoolStatusService {
  constructor(
    protected connection: PostgresConnection,
    protected statusRepository: CarpoolStatusRepository,
    protected labelRepository: CarpoolLabelRepository,
  ) {}

  async findByOperatorJourneyId(
    operator_id: number,
    operator_journey_id: string,
  ) {
    const status = await this.statusRepository.getStatusByOperatorJourneyId(
      operator_id,
      operator_journey_id,
    );
    const anomaly = await this.labelRepository.findAnomalyByOperatorJourneyId(
      operator_id,
      operator_journey_id,
    );
    const fraud = await this.labelRepository.findFraudByOperatorJourneyId(
      operator_id,
      operator_journey_id,
    );
    return {
      status,
      anomaly,
      fraud,
    };
  }
}

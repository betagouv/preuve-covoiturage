import { provider } from "@/ilos/common/Decorators.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";
import { CarpoolLabel, CarpoolStatus } from "../interfaces/database/label.ts";
import { CarpoolLabelRepository } from "../repositories/CarpoolLabelRepository.ts";
import { CarpoolStatusRepository } from "../repositories/CarpoolStatusRepository.ts";

@provider()
export class CarpoolStatusService {
  constructor(
    protected connection: PostgresConnection,
    protected statusRepository: CarpoolStatusRepository,
    protected labelRepository: CarpoolLabelRepository,
  ) {}

  async findByOperatorJourneyId(
    operator_id: number,
    operator_journey_id: string,
  ): Promise<
    {
      created_at: Date;
      status: CarpoolStatus;
      anomaly: Array<CarpoolLabel<unknown>>;
      fraud: Array<CarpoolLabel<unknown>>;
    } | undefined
  > {
    const statusResult = await this.statusRepository
      .getStatusByOperatorJourneyId(
        operator_id,
        operator_journey_id,
      );
    if (!statusResult) {
      return;
    }
    const { created_at, ...status } = statusResult;
    const anomaly = await this.labelRepository.findAnomalyByOperatorJourneyId(
      operator_id,
      operator_journey_id,
    );
    const fraud = await this.labelRepository.findFraudByOperatorJourneyId(
      operator_id,
      operator_journey_id,
    );
    return {
      created_at,
      status,
      anomaly,
      fraud,
    };
  }

  async findBy(data: {
    operator_id: number;
    status: Array<Partial<CarpoolStatus>>;
    start: Date;
    end: Date;
    limit: number;
    offset: number;
  }): Promise<Array<{ operator_journey_id: string }>> {
    return this.statusRepository.getOperatorJourneyIdByStatus(data);
  }
}

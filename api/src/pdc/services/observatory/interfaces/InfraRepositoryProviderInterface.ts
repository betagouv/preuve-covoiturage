import type { ResultInterface as AiresCovoiturageResultInterface } from "@/pdc/services/observatory/actions/infra/AiresCovoiturageAction.ts";
import type { AiresCovoiturage as AiresCovoiturageParamsInterface } from "@/pdc/services/observatory/dto/infra/AiresCovoiturage.ts";

export type { AiresCovoiturageParamsInterface, AiresCovoiturageResultInterface };

export interface InfraRepositoryInterface {
  getAiresCovoiturage(
    params: AiresCovoiturageParamsInterface,
  ): Promise<AiresCovoiturageResultInterface>;
}

export abstract class InfraRepositoryInterfaceResolver implements InfraRepositoryInterface {
  async getAiresCovoiturage(
    params: AiresCovoiturageParamsInterface,
  ): Promise<AiresCovoiturageResultInterface> {
    throw new Error();
  }
}

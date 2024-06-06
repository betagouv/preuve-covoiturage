import type {
  ParamsInterface as AiresCovoiturageParamsInterface,
  ResultInterface as AiresCovoiturageResultInterface,
} from '@/shared/observatory/infra/airesCovoiturage.contract.ts';

export type { AiresCovoiturageParamsInterface, AiresCovoiturageResultInterface };

export interface InfraRepositoryInterface {
  getAiresCovoiturage(params: AiresCovoiturageParamsInterface): Promise<AiresCovoiturageResultInterface>;
}

export abstract class InfraRepositoryInterfaceResolver implements InfraRepositoryInterface {
  async getAiresCovoiturage(params: AiresCovoiturageParamsInterface): Promise<AiresCovoiturageResultInterface> {
    throw new Error();
  }
}

import { CreateJourneyDTO } from '@shared/acquisition/common/interfaces/CreateJourneyDTO';

export interface Acquisition<TPayload> {
  _id: number;
  api_version: number;
  operator_id: number;
  created_at: Date;
  payload: TPayload;
}

import { ParamsInterface as CrossCheckParamsInterface } from '@shared/carpool/crosscheck.contract';

export { CreateJourneyDTO as PayloadV3 };
export type ResultInterface = CrossCheckParamsInterface;

export interface NormalizationProviderInterface<TPayload> {
  handle(params: Acquisition<TPayload>): Promise<ResultInterface>;
}

import { JourneyInterface } from '../shared/common/interfaces/JourneyInterface';
import { CreateJourneyDTO } from '../shared/acquisition/common/interfaces/CreateJourneyDTO';

export interface Acquisition<P> {
  _id: number;
  api_version: number;
  operator_id: number;
  created_at: Date;
  payload: P;
}

import { ParamsInterface as CrossCheckParamsInterface } from '../shared/carpool/crosscheck.contract';

export { JourneyInterface as PayloadV2 };
export { CreateJourneyDTO as PayloadV3 };
export type ResultInterface = CrossCheckParamsInterface;

export interface NormalizationProviderInterface<P> {
  handle(params: Acquisition<P>): Promise<ResultInterface>;
}

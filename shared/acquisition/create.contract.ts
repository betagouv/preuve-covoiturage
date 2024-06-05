import type { CreateJourneyDTO as PayloadV3 } from './common/interfaces/CreateJourneyDTO.ts';

interface Payload {
  api_version: string;
}

export { PayloadV3 };
export type ParamsInterface = Payload & PayloadV3;
export interface ResultInterface {
  operator_journey_id: string;
  created_at: Date;
}
export const handlerConfig = {
  service: 'acquisition',
  method: 'create',
} as const;
export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;

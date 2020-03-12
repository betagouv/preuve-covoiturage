import { JourneyInterface } from '../common/interfaces/JourneyInterface';

declare type ResultType = { journey_id: string; created_at: Date };

export interface ParamsInterface extends JourneyInterface {}
export type ResultInterface = ResultType | ResultType[];
export const handlerConfig = {
  service: 'acquisition',
  method: 'create',
};
export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

import { JourneyInterface } from '../common/interfaces/JourneyInterface';

interface JourneyResult {
  journey_id: string;
  created_at: Date;
}

export interface ParamsInterface extends JourneyInterface {}
export type ResultInterface = JourneyResult | JourneyResult[];
export const handlerConfig = {
  service: 'acquisition',
  method: 'create',
};
export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

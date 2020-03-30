import { JourneyInterface } from '../common/interfaces/JourneyInterface';

export interface ParamsInterface extends JourneyInterface {}
export interface ResultInterface {
  journey_id: string;
  created_at: Date;
}
export const handlerConfig = {
  service: 'acquisition',
  method: 'create',
};
export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

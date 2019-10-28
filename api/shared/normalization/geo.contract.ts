import { JourneyInterface } from '../common/interfaces/JourneyInterface';

export type ResultInterface = JourneyInterface | JourneyInterface[];
export interface ParamsInterface extends JourneyInterface {
  _id: string;
}
export const handlerConfig = {
  service: 'normalization',
  method: 'geo',
};
export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

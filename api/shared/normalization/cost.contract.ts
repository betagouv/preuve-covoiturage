import { JourneyInterface } from '../common/interfaces/JourneyInterface';

export type ResultInterface = JourneyInterface | JourneyInterface[];
export interface ParamsInterface extends JourneyInterface {
  _id: number;
}
export const handlerConfig = {
  service: 'normalization',
  method: 'cost',
};
export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

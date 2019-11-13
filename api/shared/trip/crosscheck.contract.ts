import { JourneyInterface } from '../common/interfaces/JourneyInterface';

export interface ParamsInterface extends JourneyInterface {
  _id: number;
}
export type ResultInterface = void;

export const handlerConfig = {
  service: 'trip',
  method: 'crosscheck',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

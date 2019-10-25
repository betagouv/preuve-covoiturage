import { JourneyInterface } from '../common/interfaces/JourneyInterface';

export interface ParamsInterface extends JourneyInterface {
  _id: string;
}
export type ResultInterface = void;

export const handlerConfig = {
  service: 'trip',
  method: 'crosscheck',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

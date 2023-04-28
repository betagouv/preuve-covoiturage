
import { StatusEnum } from './status.contract'

export interface ParamsInterface {
  operator_id: number;
  status: StatusEnum;
  limit?: number;
  offset?: number;
  start?: Date;
  end?: Date;
}

export type ResultInterface = Array<{
  operator_journey_id: string;
}>;

export const handlerConfig = {
  service: 'acquisition',
  method: 'list',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

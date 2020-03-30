import { ErrorStage, AcquisitionErrorInterface } from './common/interfaces/AcquisitionErrorInterface';

export interface ParamsInterface {
  journey_id?: string;
  operator_id?: number;
  error_stage?: ErrorStage;
  start_date?: Date;
  end_date?: Date;
  error_code?: string;
}

export type ResultInterface = AcquisitionErrorInterface[];

export const handlerConfig = {
  service: 'acquisition',
  method: 'searcherrors',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

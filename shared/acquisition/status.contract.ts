export interface ParamsInterface {
  operator_journey_id: string;
  operator_id: number;
}

export enum StatusEnum {
  AcqusitionError = 'acquisition_error',
  NormalizationError = 'normalization_error',
  FraudError = 'fraud_error',
  Ok = 'ok',
  Expired = 'expired',
  Canceled = 'canceled',
  Pending = 'pending',
}

interface StatusData extends Record<string, any>{
  message: string;
}

export interface ResultInterface {
  operator_journey_id: string;
  status: StatusEnum;
  created_at: Date;
  data?: StatusData;
}

export const handlerConfig = {
  service: 'acquisition',
  method: 'status',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

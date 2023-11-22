export interface ParamsInterface {
  operator_journey_id: string;
  operator_id: number;
}

export enum StatusEnum {
  AcquisitionError = 'acquisition_error',
  ValidationError = 'validation_error',
  NormalizationError = 'normalization_error',
  FraudError = 'fraud_error',
  AnomalyError = 'anomaly_error',
  Ok = 'ok',
  Expired = 'expired',
  Canceled = 'canceled',
  Pending = 'pending',
  Unknown = 'unknown',
}

export interface ResultInterface {
  operator_journey_id: string;
  status: StatusEnum;
  created_at: Date;
  fraud_error_labels?: string[];
}

export const handlerConfig = {
  service: 'acquisition',
  method: 'status',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

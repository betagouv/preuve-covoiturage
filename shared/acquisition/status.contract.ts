export interface ParamsInterface {
  operator_journey_id: string;
  operator_id: number;
}

export interface AnomalyErrorDetails {
  label: 'temporal_overlap_anomaly';
  metas: {
    conflicting_journey_id: string;
    temporal_overlap_duration_ratio: number;
  };
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
  anomaly_error_details?: AnomalyErrorDetails[];
}

export const handlerConfig = {
  service: 'acquisition',
  method: 'status',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

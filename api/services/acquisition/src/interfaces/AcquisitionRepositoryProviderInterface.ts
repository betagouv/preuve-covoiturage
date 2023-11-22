import { StatusEnum } from '../shared/acquisition/status.contract';

export enum AcquisitionStatusEnum {
  Ok = 'ok',
  Error = 'error',
  Pending = 'pending',
  Canceled = 'canceled',
}

export enum AcquisitionErrorStageEnum {
  Acquisition = 'acquisition',
  Normalisation = 'normalization',
  Fraud = 'fraud',
}

export interface AcquisitionCreateInterface<P = any> {
  payload: P;
  operator_id: number;
  operator_journey_id: string;
  application_id: number;
  api_version: number;
  request_id?: string;
  status?: AcquisitionStatusEnum;
  error_stage?: AcquisitionErrorStageEnum;
  errors?: any;
}

export interface AcquisitionCreateResultInterface {
  operator_journey_id: string;
  created_at: Date;
}

export interface AcquisitionSearchInterface {
  from?: Date;
  to?: Date;
  limit: number;
  status?: AcquisitionStatusEnum;
}

export interface AcquisitionStatusInterface {
  _id: number;
  created_at: Date;
  updated_at: Date;
  operator_journey_id: string;
  status: StatusEnum;
  fraud_error_labels?: string[];
  anomaly_error_labels: string[];
}

export interface AcquisitionStatusUpdateInterface {
  acquisition_id: number;
  status: AcquisitionStatusEnum;
  error_stage?: AcquisitionErrorStageEnum;
  errors?: Error[];
}

export interface AcquisitionFindInterface<P> {
  _id: number;
  operator_id: number;
  api_version: number;
  created_at: Date;
  payload: P;
}

export interface StatusSearchInterface {
  operator_id: number;
  status: StatusEnum;
  offset: number;
  limit: number;
  end: Date;
  start: Date;
}

export interface AcquisitionRepositoryProviderInterface {
  createOrUpdateMany<P = any>(
    data: Array<AcquisitionCreateInterface<P>>,
  ): Promise<Array<AcquisitionCreateResultInterface>>;

  updateManyStatus(data: Array<AcquisitionStatusUpdateInterface>): Promise<void>;

  patchPayload<P = any>(
    search: { operator_id: number; operator_journey_id: string; status: Array<AcquisitionStatusEnum> },
    payload: P,
  ): Promise<void>;

  getStatus(operator_id: number, operator_journey_id: string): Promise<AcquisitionStatusInterface | undefined>;

  list(search: StatusSearchInterface): Promise<Array<{ operator_journey_id: string }>>;

  cancel(operator_id: number, operator_journey_id: string, code?: string, message?: string): Promise<void>;

  findThenUpdate<P = any>(
    search: AcquisitionSearchInterface,
  ): Promise<[Array<AcquisitionFindInterface<P>>, (data?: AcquisitionStatusUpdateInterface) => Promise<void>]>;
}

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

export interface AcquisitionStatusSearchInterfaceA {
  operator_journey_id: string;
  operator_id: number;
}

export interface AcquisitionStatusSearchInterfaceB {
  acquisition_id: number;
}

export type AcquisitionStatusSearchInterface = AcquisitionStatusSearchInterfaceA | AcquisitionStatusSearchInterfaceB;

export interface AcquisitionStatusInterface {
  _id: number;
  created_at: Date;
  updated_at: Date;
  operator_journey_id: string;
  status: AcquisitionStatusEnum;
  error_stage?: AcquisitionErrorStageEnum;
  errors?: any;
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
export interface AcquisitionRepositoryProviderInterface {
  createOrUpdateMany<P = any>(
    data: Array<AcquisitionCreateInterface<P>>,
  ): Promise<Array<AcquisitionCreateResultInterface>>;

  updateManyStatus(data: Array<AcquisitionStatusUpdateInterface>): Promise<void>;

  getStatus(search: AcquisitionStatusSearchInterface): Promise<AcquisitionStatusInterface>;

  findThenUpdate<P = any>(
    search: AcquisitionSearchInterface,
  ): Promise<[Array<AcquisitionFindInterface<P>>, (data: Array<AcquisitionStatusUpdateInterface>) => Promise<void>]>;
}

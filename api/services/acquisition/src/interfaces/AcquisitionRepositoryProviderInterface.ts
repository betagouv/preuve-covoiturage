enum AcquisitionStatusEnum {
  Ok = 'ok',
  Error = 'error',
  Todo = 'todo',
}

enum AcquisitionErrorStageEnum {
  Acquisition = 'acquisition',
  Normalisation = 'normalization',
  Fraud = 'fraud',
}

interface AcquisitionCreateContextInterface {
  operator_id: number;
  operator_journey_id: string;
  application_id: number;
  api_version: number;
  request_id?: string;
}

interface AcquisitionCreateInterface {
  operator_journey_id: string;
  created_at: Date;
}

interface AcquisitionSearchInterface {
  from?: Date;
  to?: Date;
  limit?: number;
  status?: AcquisitionStatusEnum;
}

interface AcquisitionStatusSearchInterface {
  operator_journey_id: string;
  operator_id: number;
  acquisition_id: number;
}

interface AcquisitionStatusInterface {
  operator_journey_id: string;
  status: AcquisitionStatusEnum;
  error_stage?: AcquisitionErrorStageEnum;
  errors: any;
}

export interface AcquisitionRepositoryProviderInterface {
  createOrUpdate(
    payload: any,
    context: AcquisitionCreateContextInterface,
  ): Promise<AcquisitionCreateInterface>;

  updateStatus(
    acquisition_id: number,
    status: AcquisitionStatusEnum,
    error_stage?: AcquisitionErrorStageEnum,
    errors?: any,
  ): Promise<void>;

  getStatus(
    search: AcquisitionStatusSearchInterface
  ): Promise<AcquisitionStatusInterface>;

  findThenUpdate(
    search: AcquisitionSearchInterface
  ): Promise<[Array<{ acquisition_id: number; payload: any }>, (data: Array<{ acquisition_id: number; status: AcquisitionStatusEnum; error_stage?: AcquisitionErrorStageEnum; errors?: any }>) => Promise<void>]>
}

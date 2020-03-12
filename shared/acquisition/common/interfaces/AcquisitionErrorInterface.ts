export enum ErrorStage {
  Acquisition = 'acquisition',
  Normalisation = 'normalization',
  Fraud = 'fraud',
}

export interface AcquisitionErrorInterface {
  _id?: number;
  created_at?: Date;
  journey_id: string;
  operator_id: number;
  journey_id?: string;
  request_id?: string;
  source: string;
  error_message: string | null;
  error_code: string | null;
  error_line: number | null;
  error_stage: ErrorStage;
  error_attempt?: number;
  error_resolved: boolean;
  auth: any;
  headers: any;
  body: any;
}

export enum ErrorStage {
  Acquisition = 'acquisition',
  Normalisation = 'normalisation',
  Fraud = 'fraud',
}

export interface AcquisitionErrorInterface {
  _id?: number;
  created_at?: Date;
  journey_id: string;
  operator_id: number;
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

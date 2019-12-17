export interface AcquisitionErrorInterface {
  _id?: number;
  created_at?: Date;
  operator_id: number;
  source: string;
  error_message: string | null;
  error_code: string | null;
  error_line: number | null;
  auth: any;
  headers: any;
  body: any;
}

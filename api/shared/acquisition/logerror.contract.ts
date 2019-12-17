export interface ParamsInterface {
  operator_id: number;
  source: string;
  error_message: string | null;
  error_code: string | null;
  error_line: number | null;
  auth: any;
  headers: any;
  body: any;
}

export interface ResultInterface {
  _id: number;
  created_at: Date;
}

export const handlerConfig = {
  service: 'acquisition',
  method: 'logerror',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

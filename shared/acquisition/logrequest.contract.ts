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

export type ResultInterface = void;

export const handlerConfig = {
  service: 'acquisition',
  method: 'logrequest',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

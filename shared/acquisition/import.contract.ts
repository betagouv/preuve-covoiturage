export interface ParamsInterface {
  operator_id?: number;
  data: string;
}

export interface SingleResultInterface {
  journey_id: string;
  success: boolean;
  error?: string;
  created_at?: Date;
}

export type ResultInterface = SingleResultInterface[];

export const handlerConfig = {
  service: 'acquisition',
  method: 'import',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

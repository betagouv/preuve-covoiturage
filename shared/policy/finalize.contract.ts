export interface ParamsInterface {
  to?: Date;
  from?: Date;
}

export type ResultInterface = void;

export const handlerConfig = {
  service: 'campaign',
  method: 'finalize',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

export interface ParamsInterface {
  template: string;
  to: string;
  data: { [k: string]: any };
}

export type ResultInterface = void;

export const handlerConfig = {
  service: 'user',
  method: 'notify',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;

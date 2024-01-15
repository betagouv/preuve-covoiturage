export interface ParamsInterface {
  email: string;
}

export type ResultInterface = void;

export const handlerConfig = {
  service: 'user',
  method: 'forgottenPassword',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;

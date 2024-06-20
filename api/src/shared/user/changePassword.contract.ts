export interface ParamsInterface {
  _id: number;
  old_password: string;
  new_password: string;
}

export type ResultInterface = boolean;

export const handlerConfig = {
  service: 'user',
  method: 'changePassword',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;

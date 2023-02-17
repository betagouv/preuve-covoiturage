export interface ParamsInterface {
  email: string;
  body: string;
  name?: string;
  company?: string;
  job?: string;
  subject?: string;
}

export type ResultInterface = void;

export const handlerConfig = {
  service: 'user',
  method: 'contactform',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

export interface ParamsInterface {
  siret: string[];
}

export type ResultInterface = Array<{
  _id: number;
  siret: string;
}>;

export const handlerConfig = {
  service: 'operator',
  method: 'findbysiret',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

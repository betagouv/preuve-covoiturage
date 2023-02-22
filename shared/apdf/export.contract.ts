export interface ParamsInterface {
  format: {
    tz: string;
  };
  query: {
    campaign_id: number[];
    operator_id?: number[];
    date?: {
      start: Date;
      end: Date;
    };
  };
}

export type ResultInterface = string[];

export const handlerConfig = {
  service: 'apdf',
  method: 'export',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

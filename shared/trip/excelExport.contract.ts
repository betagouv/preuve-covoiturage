export interface ParamsInterface {
  format: {
    tz: string;
  };
  query: {
    date?: {
      start: Date;
      end: Date;
    };
    campaign_id: number[];
  };
}

export type ResultInterface = string[];

export const handlerConfig = {
  service: 'trip',
  method: 'excelExport',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

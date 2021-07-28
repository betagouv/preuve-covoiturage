export interface ParamsInterface {
  format: {
    tz: string;
  };
  query: {
    date?: {
      start: Date;
      end: Date;
    };
    territory_id?: number;
    campaign_id?: number[];
  };
}

export type ResultInterface = void;

export const handlerConfig = {
  service: 'trip',
  method: 'buildExcelExport',
};
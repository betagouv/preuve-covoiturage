export interface ParamsInterface {
  tz?: string;
  date: {
    start: Date;
    end: Date;
  };
  operator_id?: number[];
  territory_id?: number[];
}
export type ResultInterface = void;

export const handlerConfig = {
  service: 'trip',
  method: 'export',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

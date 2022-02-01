// operator_id could be number if set from middleware
export interface ParamsInterface extends Omit<BaseParamsInterface, 'territory_id'> {
  territory_id?: number[];
}

export interface BaseParamsInterface {
  tz?: string;
  date: {
    start: Date;
    end: Date;
  };
  // eslint-disable-next-line max-len
  operator_id?: number[]; //optional operator_id(s) fetch from form (for a territory), fetched context from middleware if operator
  territory_id?: number; // optional territory_id params
}

export type ResultInterface = void;

export const handlerConfig = {
  service: 'trip',
  method: 'export',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

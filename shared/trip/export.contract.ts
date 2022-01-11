// operator_id could be number if set from middleware
export interface ParamsInterface extends Omit<BaseParamsInterface, 'operator_id'> {
  operator_id: number[] | number; // operator_id(s) fetch from midleware (for an operator) or form (for a territory)
}

export interface BaseParamsInterface {
  tz?: string;
  date: {
    start: Date;
    end: Date;
  };
  operator_id: number[]; // operator_id(s) fetch from form (for a territory)
  territory_id?: number; // territory_id params, context fetch from middleware otherwise
}

export type ResultInterface = void;

export const handlerConfig = {
  service: 'trip',
  method: 'export',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

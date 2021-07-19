export interface ParamsInterface {
  format: {
    tz: string;
    filename?: string;
  };
  query: {
    date: {
      start: Date;
      end: Date;
    };
    territory_authorized_operator_id?: number[]; // territory id for operator visibility filtering
    operator_id?: number[];
    territory_id?: number[];
  };
  type?: string;
}
export type ResultInterface = string;

export const handlerConfig = {
  service: 'trip',
  method: 'buildExport',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

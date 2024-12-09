export interface SingleResultInterface {
  id: string;
  start_date: Date;
  end_date: Date;
  territory_id: string;
  territory_name: string;
  name: string;
  description: string;
  unit: string;
  status: string;
  handler: string;
  incentive_sum: number;
  max_amount: number;
}

export type ResultInterface = SingleResultInterface[];

export interface ParamsInterface {
  territory_id?: string;
}

export const handlerConfig = {
  service: "dashboard",
  method: "campaigns",
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;

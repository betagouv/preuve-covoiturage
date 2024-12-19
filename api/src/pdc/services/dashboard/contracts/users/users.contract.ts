export interface SingleResultInterface {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  operator_id?: number;
  territory_id?: number;
  phone: string;
  status: string;
  role: string;
}

export interface ParamsInterface {
  id?: number;
}

export type ResultInterface = SingleResultInterface[];

export const handlerConfig = {
  service: "dashboard",
  method: "users",
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;

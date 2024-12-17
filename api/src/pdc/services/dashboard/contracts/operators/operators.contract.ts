export interface SingleResultInterface {
  id: number;
  name: string;
}

export interface ParamsInterface {
  id?: number;
}

export type ResultInterface = SingleResultInterface[];

export const handlerConfig = {
  service: "dashboard",
  method: "operators",
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;

export interface SingleResultInterface {
  id: string;
  name: string;
}

export type ResultInterface = SingleResultInterface[];

export const handlerConfig = {
  service: "dashboard",
  method: "territories",
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;

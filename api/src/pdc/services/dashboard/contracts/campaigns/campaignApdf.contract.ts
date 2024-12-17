export interface SingleResultInterface {
  signed_url: string;
  key: string;
  size: number;
  operator_id: number;
  campaign_id: number;
  datetime: Date;
  name: string;
}
export type ResultInterface = SingleResultInterface[];

export interface ParamsInterface {
  campaign_id: number;
}

export const handlerConfig = {
  service: "dashboard",
  method: "campaignApdf",
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;

export interface ParamsInterface {
  campaign_id: number;
  operator_id?: number;
}

export type EnrichedFundingRequestType = {
  signed_url: string;
  key: string;
  size: number;
  operator_id: number;
  campaign_id: number;
  datetime: Date;
  name: string;
};

export type ResultsInterface = EnrichedFundingRequestType[];

export const handlerConfig = {
  service: 'policy',
  method: 'fundingRequestsList',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

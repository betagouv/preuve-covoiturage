export type ResultInterface = S3Object[];

// TODO replace by Partial<S3.Object> from aws-sdk
export interface S3Object {
  key?: string;
  signed_url: string;
  size?: number;
}

export interface ParamsInterface {
  campaign_id: number;
  operator_id?: number;
  territory_id: number;
}

export const handlerConfig = {
  service: 'policy',
  method: 'fundingRequestsList',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

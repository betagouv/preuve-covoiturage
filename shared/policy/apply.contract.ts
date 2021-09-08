export type ParamsInterface = {
  campaign_id?: number;
  override_from?: Date;
};

export type ResultInterface = void;

export const handlerConfig = {
  service: 'campaign',
  method: 'apply',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

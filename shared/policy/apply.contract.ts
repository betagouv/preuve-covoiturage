export type ParamsInterface = {
  policy_id?: number;
  override_from?: Date;
};

export type ResultInterface = void;

export const handlerConfig = {
  service: 'campaign',
  method: 'apply',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

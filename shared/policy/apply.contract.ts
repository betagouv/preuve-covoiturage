import { Timezone } from '@pdc/provider-validator';

export type ParamsInterface = {
  policy_id?: number;
  override_from?: Date | string;
  override_until?: Date | string;
  tz?: Timezone;
};

export type ResultInterface = void;

export const handlerConfig = {
  service: 'campaign',
  method: 'apply',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

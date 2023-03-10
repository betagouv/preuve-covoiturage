import { Timezone } from '@pdc/provider-validator';

export type ParamsInterface = Partial<{
  policy_id: number;
  from: Date;
  to: Date;
  tz: Timezone;
  finalize: boolean;
  override: boolean;
}>;

export type ResultInterface = void;

export const handlerConfig = {
  service: 'campaign',
  method: 'apply',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

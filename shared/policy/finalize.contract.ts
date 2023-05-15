import { Timezone } from '@pdc/provider-validator';

export type ParamsInterface = Partial<{
  to: string;
  from: string;
  tz: Timezone;
  sync_incentive_sum: boolean;
  clear: boolean;
}>;

export type ResultInterface = void;

export const handlerConfig = {
  service: 'campaign',
  method: 'finalize',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

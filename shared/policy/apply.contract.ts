import { Timezone } from '@pdc/providers/validator/index.ts';

export type ParamsInterface = Partial<{
  policy_id: number;
  from: Date;
  to: Date;
  tz: Timezone;
  override: boolean;
}>;

export type ResultInterface = void;

export const handlerConfig = {
  service: 'campaign',
  method: 'apply',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;

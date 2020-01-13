import { AcquisitionInterface } from '../acquisition/common/interfaces/AcquisitionInterface';
import { IdentityInterface } from '../common/interfaces/IdentityInterface';
import { LegacyIdentityInterface } from '../common/interfaces/LegacyIdentityInterface';

export type ResultInterface = IdentityInterface;
export type ParamsInterface = IdentityInterface | LegacyIdentityInterface;
export const handlerConfig = {
  service: 'normalization',
  method: 'identity',
};
export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

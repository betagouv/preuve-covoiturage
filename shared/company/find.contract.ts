import { CompanyInterface } from '../common/interfaces/CompanyInterface2';

export interface ParamsInterface {
  siret: string;
  source?: string;
}

export interface ResultInterface extends CompanyInterface {}

export const handlerConfig = {
  service: 'company',
  method: 'find',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

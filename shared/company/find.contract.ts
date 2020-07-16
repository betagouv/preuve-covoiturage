import { CompanyInterface } from '../common/interfaces/CompanyInterface2';

export interface ParamsInterface {
  query: {
    siret?: string;
    _id?: number;
  };
  forceRemoteUpdate?: boolean;
}

export interface ResultInterface extends CompanyInterface {}

export const handlerConfig = {
  service: 'company',
  method: 'find',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

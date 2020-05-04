import { CertificateMetaInterface } from './common/interfaces/CertificateMetaInterface';

export interface ParamsInterface {
  operator_id?: number;
}

export type ResultInterface = Omit<CertificateMetaInterface, 'rows'>;

export type RepositoryInterface = Required<ParamsInterface>;

export const handlerConfig = {
  service: 'certificate',
  method: 'list',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

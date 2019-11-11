import { CertificateInterface } from './common/interfaces/CertificateInterface';

export interface ParamsInterface {
  user_id: string;
}

export interface ResultInterface extends CertificateInterface {}

export type RepositoryInterface = Required<ParamsInterface>;

export const handlerConfig = {
  service: 'certificate',
  method: 'print',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

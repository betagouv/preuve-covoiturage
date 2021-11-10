import { MetaPersonDisplayInterface } from './common/interfaces/CertificateMetaInterface';

export interface ParamsInterface {
  uuid: string;
}

// export interface ResultInterface extends CertificateInterface {}
export interface ResultInterface {
  uuid: string;
  identity_uuid: string;
  operator_uuid: string;
  start_at: Date;
  end_at: Date;
  driver: MetaPersonDisplayInterface;
  passenger: MetaPersonDisplayInterface;
  created_at: Date;
}

export type RepositoryInterface = Required<ParamsInterface>;

export const handlerConfig = {
  service: 'certificate',
  method: 'find',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

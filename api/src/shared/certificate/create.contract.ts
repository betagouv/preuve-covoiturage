import { IdentityIdentifiersInterface } from './common/interfaces/IdentityIdentifiersInterface.ts';
import { PointInterface } from '../common/interfaces/PointInterface.ts';
import { CertificateMetaInterface } from './common/interfaces/CertificateMetaInterface.ts';

export interface ParamsInterface {
  tz: string;
  identity: IdentityIdentifiersInterface;
  operator_id: number;
  positions?: PointInterface[];
  start_at?: Date;
  end_at?: Date;
}

export interface ResultInterface {
  uuid: string;
  created_at: Date;
  meta: Omit<CertificateMetaInterface, 'identity' | 'operator'>;
}

export type RepositoryInterface = Required<ParamsInterface>;

export const handlerConfig = {
  service: 'certificate',
  method: 'create',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;

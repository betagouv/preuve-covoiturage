import { IdentityIdentifiersInterface } from './common/interfaces/IdentityIdentifiersInterface';
import { CertificateInterface } from './common/interfaces/CertificateInterface';
import { PointInterface } from '../common/interfaces/PointInterface';

export interface ParamsInterface {
  tz: string;
  identity: IdentityIdentifiersInterface;
  operator_id: number;
  start_pos?: PointInterface;
  end_pos?: PointInterface;
  start_at?: Date;
  end_at?: Date;
}

export interface ResultInterface extends CertificateInterface {}

export type RepositoryInterface = Required<ParamsInterface>;

export const handlerConfig = {
  service: 'certificate',
  method: 'create',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

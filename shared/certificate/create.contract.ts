import { IdentityIdentifiersInterface } from './common/interfaces/IdentityIdentifiersInterface';
import { CertificateInterface } from './common/interfaces/CertificateInterface';

export interface ParamsInterface {
  identity: IdentityIdentifiersInterface;
  operator_id: number;
  territory_id: number;
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

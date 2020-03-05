import { CertificateMetaInterface } from './CertificateMetaInterface';

export interface CertificateBaseInterface {
  identity_uuid: string;
  operator_uuid: string;
  territory_uuid: string;
  start_at: Date;
  end_at: Date;
  meta: CertificateMetaInterface;
}

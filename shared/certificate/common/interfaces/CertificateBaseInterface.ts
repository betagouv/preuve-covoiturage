import { CertificateMetaInterface } from './CertificateMetaInterface';

export interface CertificateBaseInterface {
  identity_id: string;
  operator_id: string;
  territory_id: string;
  start_at: Date;
  end_at: Date;
  meta: CertificateMetaInterface;
}

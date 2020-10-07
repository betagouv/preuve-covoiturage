import { CertificateMetaInterface } from './CertificateMetaInterface';

export interface CertificateBaseInterface {
  identity_uuid: string;
  operator_id: number;
  start_at: Date;
  end_at: Date;
  meta: CertificateMetaInterface;
}

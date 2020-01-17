import { CertificateBaseInterface, CertificateAccessLogInterface } from './CertificateBaseInterface';

export interface CertificateInterface extends CertificateBaseInterface {
  _id: string;
  uuid: string;
  created_at: Date;
  updated_at: Date;
  access_log?: CertificateAccessLogInterface[];
}

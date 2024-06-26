import { CertificateBaseInterface } from './CertificateBaseInterface.ts';
import { CertificateAccessLogInterface } from './CertificateAccessLogInterface.ts';

export interface CertificateInterface extends CertificateBaseInterface {
  _id: number;
  uuid: string;
  created_at: Date;
  updated_at: Date;
  access_log?: CertificateAccessLogInterface[];
}

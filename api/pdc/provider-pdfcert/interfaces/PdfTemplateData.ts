import { CertificateMetaInterface } from '../shared/certificate/common/interfaces/CertificateMetaInterface';

export interface PdfTemplateData {
  title: string;
  data: CertificateMetaInterface;
  identity: string;
  operator: string;
  support: string;
  certificate: {
    uuid: string;
    created_at: string;
    start_at: string;
    end_at: string;
  };
  validation: {
    url: string;
    qrcode: string;
  };
  header?: {
    operator?: {
      image?: string;
      name?: string;
      content?: string;
    };
    identity?: {
      name?: string;
      content?: string;
    };
    notes?: string;
  };
}

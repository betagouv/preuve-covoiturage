export interface PdfTemplateData {
  title: string;
  data: any;
  identity: string;
  operator: string;
  territory: string;
  certificate: {
    created_at: string;
    start_at: string;
    end_at: string;
  };
  validation: {
    url: string;
    qrcode: string;
  };
}

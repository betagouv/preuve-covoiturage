export interface PdfTemplateData {
  title: string;
  data: any;
  identity: string;
  operator: string;
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

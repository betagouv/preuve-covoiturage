export interface DowloadCertificateBase {
  operator_id: number;
  meta?: {
    operator?: {
      content?: string;
    };
    identity?: {
      name?: string;
      content?: string;
    };
    notes?: string;
  };
}

export interface ParamsInterface extends DowloadCertificateBase {
  uuid: string;
}

export interface ResultInterface {
  headers: { [k: string]: string };
  body: ArrayBuffer;
}

export const handlerConfig = {
  service: 'certificate',
  method: 'download',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

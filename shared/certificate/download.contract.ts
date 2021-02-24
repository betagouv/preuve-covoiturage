export interface ParamsInterface {
  uuid: string;
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

// should be Buffer but fails with the frontend
export interface ResultInterface {
  headers: { [k: string]: string };
  body: Buffer;
}

export const handlerConfig = {
  service: 'certificate',
  method: 'download',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

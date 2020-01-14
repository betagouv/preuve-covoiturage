export interface ParamsInterface {
  operator_user_id: string;
  start_at: Date;
  end_at: Date;
}

export interface ResultInterface {
  contentType: 'text/html' | 'application/pdf' | 'image/png';
  data: string | Buffer;
}

export type RepositoryInterface = Required<ParamsInterface>;

export const handlerConfig = {
  service: 'certificate',
  method: 'generate',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

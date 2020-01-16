export interface ParamsInterface {
  identity: string;
  start_at: Date;
  end_at: Date;
  type: 'html' | 'json';
}

export interface ResultInterface {
  type: 'text/html' | 'application/json';
  data: string | Buffer | object;
  params: ParamsInterface;
  code: number;
}

export type RepositoryInterface = Required<ParamsInterface>;

export const handlerConfig = {
  service: 'certificate',
  method: 'render',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

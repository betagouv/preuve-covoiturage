export interface ParamsInterface {
  uuid: string;
  token: string;
}

export interface ResultInterface {
  type: 'text/html';
  data: string;
  params: ParamsInterface;
  code: number;
}

export type RepositoryInterface = Required<ParamsInterface>;

export const handlerConfig = {
  service: 'certificate',
  method: 'render',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

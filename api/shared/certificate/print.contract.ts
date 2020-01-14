export interface ParamsInterface {
  operator_user_id: string;
  start_at?: Date;
  end_at?: Date;
}

// export interface ResultInterface extends CertificateInterface {}
export type ResultInterface = void;

export type RepositoryInterface = Required<ParamsInterface>;

export const handlerConfig = {
  service: 'certificate',
  method: 'print',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

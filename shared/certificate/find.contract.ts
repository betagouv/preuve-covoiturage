export interface ParamsInterface {
  uuid: string;
}

// export interface ResultInterface extends CertificateInterface {}
export interface ResultInterface {
  uuid: string;
  signature: string;
  start_at: Date;
  end_at: Date;
  created_at: Date;
  total_km: number;
  total_point: number;
  total_cost: number;
  remaining: number;
}

export type RepositoryInterface = Required<ParamsInterface>;

export const handlerConfig = {
  service: 'certificate',
  method: 'find',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

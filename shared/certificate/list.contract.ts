import { PointInterface } from '../common/interfaces/PointInterface';

export interface Pagination {
  start_index: number;
  length: number;
}

export interface ParamsInterface {
  operator_id?: number;
  pagination?: Pagination;
}

export interface ResultRowInterface {
  uuid: string;
  tz: string;
  operator: { uuid: string; name: string };
  territory?: { uuid: string; name: string };
  start_pos?: PointInterface;
  end_pos?: PointInterface;
  total_km: number;
  total_point: number;
  total_rm: number;
}
export type ResultInterface = {
  rows: ResultRowInterface[];
  length: number;
};

// export type RepositoryInterface = Required<ParamsInterface>;
export type RepositoryInterface = ParamsInterface;

export const handlerConfig = {
  service: 'certificate',
  method: 'list',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

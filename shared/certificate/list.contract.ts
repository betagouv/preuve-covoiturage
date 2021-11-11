import { PointInterface } from '../common/interfaces/PointInterface';
import { MetaPersonDisplayInterface } from './common/interfaces/CertificateMetaInterface';

export interface Pagination {
  start_index: number;
  length: number;
}

export enum RowType {
  OK = 'ok',
  EXPIRED = 'expired',
}

export interface ResultRowInterface {
  type: RowType;
  uuid: string;
  tz: string;
  operator: { uuid: string; name: string };
  start_pos?: PointInterface;
  end_pos?: PointInterface;
  driver: MetaPersonDisplayInterface;
  passenger: MetaPersonDisplayInterface;
}

export interface ParamsInterface {
  operator_id?: number;
  pagination?: Pagination;
}

export type ResultInterface = {
  rows: ResultRowInterface[];
  length: number;
};

export type RepositoryInterface = ParamsInterface;

export const handlerConfig = {
  service: 'certificate',
  method: 'list',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

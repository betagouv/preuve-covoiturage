import { PointInterface } from '../common/interfaces/PointInterface';

export interface ParamsInterface {
  operator_id?: number;
}

export type ResultInterface = {
  uuid: string;
  tz: string;
  operator: { uuid: string; name: string };
  territory?: { uuid: string; name: string };
  start_pos?: PointInterface;
  end_pos?: PointInterface;
  total_km: number;
  total_point: number;
  total_cost: number;
  remaining: number;
};

export type RepositoryInterface = Required<ParamsInterface>;

export const handlerConfig = {
  service: 'certificate',
  method: 'list',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

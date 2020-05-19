import { IdentityIdentifiersInterface } from './common/interfaces/IdentityIdentifiersInterface';
import { PointInterface } from '../common/interfaces/PointInterface';

export interface ParamsInterface {
  tz: string;
  identity: IdentityIdentifiersInterface;
  operator_id: number;
  start_pos?: PointInterface;
  end_pos?: PointInterface;
  start_at?: Date;
  end_at?: Date;
}

export interface ResultInterface {
  uuid: string;
  created_at: Date;
  pdf_url: string;
  png_url: string;
}

export type RepositoryInterface = Required<ParamsInterface>;

export const handlerConfig = {
  service: 'certificate',
  method: 'create',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;

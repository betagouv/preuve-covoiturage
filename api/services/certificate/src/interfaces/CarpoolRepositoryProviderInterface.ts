import { PointInterface } from '../shared/common/interfaces/PointInterface';

export interface CarpoolInterface {
  month: string;
  year: string;
  day: number;
  trip_id: number;
  km: number;
  rac: number;
  payments: string;
  type: string;
}

export interface FindParamsInterface {
  personUUID: string;
  operator_id: number;
  tz: string;
  start_at: Date;
  end_at: Date;
  positions?: PointInterface[];
  radius?: number;
}

export interface CarpoolRepositoryProviderInterface {
  find(params: FindParamsInterface): Promise<CarpoolInterface[]>;
}

export abstract class CarpoolRepositoryProviderInterfaceResolver implements CarpoolRepositoryProviderInterface {
  async find(params: FindParamsInterface): Promise<CarpoolInterface[]> {
    throw new Error('Method not implemented.');
  }
}

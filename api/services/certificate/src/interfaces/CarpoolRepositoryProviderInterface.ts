import { IdentityInterface } from '../shared/common/interfaces/IdentityInterface';
import { PointInterface } from '../shared/common/interfaces/PointInterface';

// TODO replace any output by proper interface
export interface CarpoolInterface {
  m: string;
  y: string;
  trips: number;
  km: number;
  rm: number;
}

export interface FindParamsInterface {
  identity: IdentityInterface;
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

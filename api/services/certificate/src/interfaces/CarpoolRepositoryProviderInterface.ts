import { PointInterface } from '../shared/common/interfaces/PointInterface';
import { CarpoolInterface } from '../shared/certificate/common/interfaces/CarpoolInterface';
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

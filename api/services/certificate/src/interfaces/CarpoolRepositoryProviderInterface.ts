import { PointInterface } from '../shared/common/interfaces/PointInterface';

// TODO replace any output by proper interface
export interface CarpoolInterface {
  m: string;
  y: string;
  trips: number;
  km: number;
  eur: number;
}

export interface CarpoolRepositoryProviderInterface {
  find(params: {
    identity_uuid: string;
    start_at: Date;
    end_at: Date;
    positions?: PointInterface[];
    radius?: number;
  }): Promise<CarpoolInterface[]>;
}

export abstract class CarpoolRepositoryProviderInterfaceResolver implements CarpoolRepositoryProviderInterface {
  async find(params: {
    identity_uuid: string;
    start_at: Date;
    end_at: Date;
    positions?: PointInterface[];
    radius?: number;
  }): Promise<CarpoolInterface[]> {
    throw new Error('Method not implemented.');
  }
}

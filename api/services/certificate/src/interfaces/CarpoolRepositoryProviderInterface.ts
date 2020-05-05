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
    identity: number;
    start_at: Date;
    end_at: Date;
    start_pos: PointInterface;
    end_pos: PointInterface;
    radius?: number;
  }): Promise<CarpoolInterface[]>;
}

export abstract class CarpoolRepositoryProviderInterfaceResolver implements CarpoolRepositoryProviderInterface {
  async find(params: {
    identity: number;
    start_at: Date;
    end_at: Date;
    start_pos: PointInterface;
    end_pos: PointInterface;
    radius?: number;
  }): Promise<CarpoolInterface[]> {
    throw new Error('Method not implemented.');
  }
}

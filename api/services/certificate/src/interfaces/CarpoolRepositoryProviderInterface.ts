// TODO replace any output by proper interface
export interface CarpoolInterface {
  m: string;
  y: number;
  km: number;
  eur: number;
}

export interface CarpoolRepositoryProviderInterface {
  find(params: { identity: number; start_at: Date; end_at: Date }): Promise<CarpoolInterface[]>;
}

export abstract class CarpoolRepositoryProviderInterfaceResolver implements CarpoolRepositoryProviderInterface {
  async find(params: { identity: number; start_at: Date; end_at: Date }): Promise<CarpoolInterface[]> {
    throw new Error('Method not implemented.');
  }
}

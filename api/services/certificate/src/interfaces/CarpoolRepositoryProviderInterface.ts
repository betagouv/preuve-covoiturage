// TODO replace any output by proper interface
export interface CarpoolRepositoryProviderInterface {
  find(params: { identity: string; start_at: Date; end_at: Date }): Promise<any[]>;
}

// TODO replace any output by proper interface
export abstract class CarpoolRepositoryProviderInterfaceResolver implements CarpoolRepositoryProviderInterface {
  async find(params: { identity: string; start_at: Date; end_at: Date }): Promise<any[]> {
    throw new Error('Method not implemented.');
  }
}

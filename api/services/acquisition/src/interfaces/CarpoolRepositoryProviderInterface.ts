export interface StatusParamsInterface {
  acquisition_id: number;
  operator_id: number;
  journey_id: string;
}

export type StatusResultInterface = 'ok' | 'expired' | 'canceled';

export interface CarpoolRepositoryInterface {
  getStatusByAcquisitionId(acquisitionId: number): Promise<StatusResultInterface | undefined>;
}

export abstract class CarpoolRepositoryInterfaceResolver implements CarpoolRepositoryInterface {
  async getStatusByAcquisitionId(acquisitionId: number): Promise<StatusResultInterface | undefined> {
    throw new Error('Method not implemented.');
  }
}

export interface StatusParamsInterface {
  acquisition_id: number;
  operator_id: number;
  journey_id: string;
}

export type StatusResultInterface = 'ok' | 'expired' | 'canceled';

export interface CarpoolRepositoryInterface {
  status(data: StatusParamsInterface): Promise<StatusResultInterface>;
}

export abstract class CarpoolRepositoryInterfaceResolver implements CarpoolRepositoryInterface {
  async status(data: StatusParamsInterface): Promise<StatusResultInterface> {
    throw new Error('Method not implemented.');
  }
}

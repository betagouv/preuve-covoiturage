import {
  ParamsInterface as StatusParamsInterface,
  ResultInterface as StatusResultInterface,
} from '../shared/acquisition/carpoolstatus.contract';

export interface CarpoolRepositoryInterface {
  status(data: StatusParamsInterface): Promise<StatusResultInterface>;
}

export abstract class CarpoolRepositoryInterfaceResolver implements CarpoolRepositoryInterface {
  async status(data: StatusParamsInterface): Promise<StatusResultInterface> {
    throw new Error('Method not implemented.');
  }
}

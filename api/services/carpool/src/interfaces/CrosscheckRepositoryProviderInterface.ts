import { PositionInterface } from './Carpool';

export interface CrosscheckRepositoryProviderInterface {
  getTripId(data: {
    operator_trip_id?: string;
    datetime: Date;
    start: PositionInterface;
    end: PositionInterface;
    identity_uuid: string;
  }): Promise<string>;
}
export abstract class CrosscheckRepositoryProviderInterfaceResolver implements CrosscheckRepositoryProviderInterface {
  public async getTripId(data: {
    operator_trip_id?: string;
    datetime: Date;
    start: PositionInterface;
    end: PositionInterface;
    identity_uuid: string;
  }): Promise<string> {
    throw new Error();
  }
}

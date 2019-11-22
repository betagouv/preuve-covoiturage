import { PositionInterface } from './Carpool';

export interface CrosscheckRepositoryProviderInterface {
  getTripId(data: {
    operatorTripId: string;
    datetime: Date;
    start: PositionInterface;
    end: PositionInterface;
    identityUuid: string;
  }): Promise<string>;
}
export abstract class CrosscheckRepositoryProviderInterfaceResolver implements CrosscheckRepositoryProviderInterface {
  public async getTripId(data: {
    operatorTripId: string;
    datetime: Date;
    start: PositionInterface;
    end: PositionInterface;
    identityUuid: string;
  }): Promise<string> {
    throw new Error();
  }
}

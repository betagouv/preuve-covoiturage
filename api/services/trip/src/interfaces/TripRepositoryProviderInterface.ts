import { RepositoryInterfaceResolver, RepositoryInterface } from '@ilos/common';

import { TripInterface } from '../shared/common/interfaces/TripInterface';

export interface TripRepositoryProviderInterface extends RepositoryInterface {
  findByOperatorTripIdAndOperatorId(params: { operator_trip_id?: string; operator_id: string }): Promise<TripInterface>;
  findByPhoneAndTimeRange(phone: string, startTimeRange: { min: Date; max: Date }): Promise<TripInterface>;
  findByIdAndPatch(
    id: string,
    data: {
      [k: string]: any;
    },
  ): Promise<TripInterface>;
}

export abstract class TripRepositoryProviderInterfaceResolver extends RepositoryInterfaceResolver {
  public async findByOperatorTripIdAndOperatorId(params: {
    operator_trip_id?: string;
    operator_id: string;
  }): Promise<TripInterface> {
    throw new Error('Not implemented');
  }
  public async findByPhoneAndTimeRange(
    phone: string,
    startTimeRange: { min: Date; max: Date },
  ): Promise<TripInterface> {
    throw new Error('Not implemented');
  }
  public async findByIdAndPatch(
    id: string,
    data: {
      [k: string]: any;
    },
  ): Promise<TripInterface> {
    throw new Error('Not implemented');
  }
}

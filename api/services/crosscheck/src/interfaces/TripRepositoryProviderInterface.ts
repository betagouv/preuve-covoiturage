import { RepositoryInterfaceResolver, RepositoryInterface } from '@ilos/common';
import { PersonInterface } from '@pdc/provider-schema';

import { Trip } from '../entities/Trip';

export interface TripRepositoryProviderInterface extends RepositoryInterface {
  findByOperatorTripIdAndOperatorId(params: { operator_trip_id?: string; operator_id: string }): Promise<Trip>;
  findByPhoneAndTimeRange(phone: string, startTimeRange: { min: Date; max: Date }): Promise<Trip>;
  findByIdAndPatch(
    id: string,
    data: {
      [k: string]: any;
    },
  ): Promise<Trip>;
}

export abstract class TripRepositoryProviderInterfaceResolver extends RepositoryInterfaceResolver {
  public async findByOperatorTripIdAndOperatorId(params: {
    operator_trip_id?: string;
    operator_id: string;
  }): Promise<Trip> {
    throw new Error('Not implemented');
  }
  public async findByPhoneAndTimeRange(phone: string, startTimeRange: { min: Date; max: Date }): Promise<Trip> {
    throw new Error('Not implemented');
  }
  public async findByIdAndPatch(
    id: string,
    data: {
      [k: string]: any;
    },
  ): Promise<Trip> {
    throw new Error('Not implemented');
  }
}

import { RepositoryInterfaceResolver, RepositoryInterface } from '@ilos/common';

import { Trip } from '../entities/Trip';
import { PersonInterface } from './TripInterface';

export interface CrosscheckRepositoryProviderInterface extends RepositoryInterface {
  findByOperatorJourneyIdAndOperatorId(params: { operator_journey_id?: string; operator_id: string }): Promise<Trip>;
  findByPhoneAndTimeRange(phone: string, startTimeRange: { min: Date; max: Date }): Promise<Trip>;
  findByIdAndPushPeople(
    id: string,
    people: PersonInterface[],
    territories: string[],
    newStartDate: Date,
  ): Promise<Trip>;
}

export abstract class CrosscheckRepositoryProviderInterfaceResolver extends RepositoryInterfaceResolver {
  public async findByOperatorJourneyId(params: { operator_journey_id?: string; operator_id: string }): Promise<Trip> {
    throw new Error('Not implemented');
  }
  public async findByPhoneAndTimeRange(phone: string, startTimeRange: { min: Date; max: Date }): Promise<Trip> {
    throw new Error('Not implemented');
  }
  public async findByIdAndPushPeople(
    id: string,
    people: PersonInterface[],
    territories: string[],
    newStartDate: Date,
  ): Promise<Trip> {
    throw new Error('Not implemented');
  }
}

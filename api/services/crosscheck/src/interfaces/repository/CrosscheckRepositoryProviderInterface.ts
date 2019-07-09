import { ParentRepositoryInterface, ParentRepositoryInterfaceResolver } from '@ilos/repository';

import { Trip } from '../../entities/Trip';
import { PersonInterface } from '../TripInterface';

export interface CrosscheckRepositoryProviderInterface extends ParentRepositoryInterface {
  findByOperatorJourneyIdAndOperatorId(params: { operator_journey_id?: string; operator_id: string }): Promise<Trip>;
  findByPhoneAndTimeRange(phone: string, startTimeRange: { min: Date; max: Date }): Promise<Trip>;
  findByIdAndPushPeople(id: string, people: PersonInterface[], territory: string[], newStartDate: Date): Promise<Trip>;
}

export abstract class CrosscheckRepositoryProviderInterfaceResolver extends ParentRepositoryInterfaceResolver {
  public async findByOperatorJourneyIdAndOperatorId(params: {
    operator_journey_id?: string;
    operator_id: string;
  }): Promise<Trip> {
    throw new Error();
  }
  public async findByPhoneAndTimeRange(phone: string, startTimeRange: { min: Date; max: Date }): Promise<Trip> {
    throw new Error();
  }
  public async findByIdAndPushPeople(
    id: string,
    people: PersonInterface[],
    territory: string[],
    newStartDate: Date,
  ): Promise<Trip> {
    throw new Error();
  }
}

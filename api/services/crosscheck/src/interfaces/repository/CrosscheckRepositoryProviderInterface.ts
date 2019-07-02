import { ParentRepositoryProviderInterface, ParentRepositoryProviderInterfaceResolver } from '@ilos/provider-repository';
import {Trip} from '../../entities/trip';
import {PersonInterface} from '../TripInterface';

export interface CrosscheckRepositoryProviderInterface extends ParentRepositoryProviderInterface {
  findByOperatorJourneyIdAndOperatorId(params: { operator_journey_id?: string, operator_id: string }): Promise<Trip>;
  findByPhoneAndTimeRange(phone: string, startTimeRange: { min: Date, max: Date }): Promise<Trip>;
  findByIdAndPushPeople(id: string, people: PersonInterface[], newStartDate: Date): Promise<Trip>;
}

export abstract class CrosscheckRepositoryProviderInterfaceResolver extends ParentRepositoryProviderInterfaceResolver {
  public async findByOperatorJourneyIdAndOperatorId(params: { operator_journey_id?: string, operator_id: string }): Promise<Trip> {
    throw new Error();
  }
  public async findByPhoneAndTimeRange(phone: string, startTimeRange: { min: Date, max: Date }): Promise<Trip> {
    throw new Error();
  }
  public async findByIdAndPushPeople(id: string, people: PersonInterface[], newStartDate: Date): Promise<Trip> {
    throw new Error();
  }
}

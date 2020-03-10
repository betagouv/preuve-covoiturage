import { PeopleWithIdInterface } from './Carpool';

export interface CarpoolRepositoryProviderInterface {
  importFromAcquisition(
    shared: {
      acquisition_id: number;
      operator_id: number;
      operator_trip_id?: string;
      operator_journey_id: string;
      created_at: Date;
      operator_class: string;
      trip_id: string;
      status: string;
    },
    people: PeopleWithIdInterface[],
  ): Promise<void>;
}
export abstract class CarpoolRepositoryProviderInterfaceResolver implements CarpoolRepositoryProviderInterface {
  public async importFromAcquisition(
    shared: {
      acquisition_id: number;
      operator_id: number;
      operator_trip_id?: string;
      operator_journey_id: string;
      created_at: Date;
      operator_class: string;
      trip_id: string;
      status: string;
    },
    people: PeopleWithIdInterface[],
  ): Promise<void> {
    throw new Error();
  }
}

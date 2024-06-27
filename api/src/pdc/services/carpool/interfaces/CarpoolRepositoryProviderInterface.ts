import { PeopleWithIdInterface } from "./Carpool.ts";

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
  updateStatus(acquisition_id: number, status: string): Promise<void>;
}
export abstract class CarpoolRepositoryProviderInterfaceResolver
  implements CarpoolRepositoryProviderInterface {
  abstract importFromAcquisition(
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
  abstract updateStatus(acquisition_id: number, status: string): Promise<void>;
}

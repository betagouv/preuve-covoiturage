import { PeopleWithIdInterface } from './Carpool';
import { CarpoolInterface } from '../shared/carpool/interfaces/CarpoolInterface';

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
  find(acquisition_id: number): Promise<CarpoolInterface>;
}

export abstract class CarpoolRepositoryProviderInterfaceResolver implements CarpoolRepositoryProviderInterface {
  async importFromAcquisition(
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
    throw new Error('Method not implemented.');
  }

  async updateStatus(acquisition_id: number, status: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async find(acquisition_id: number): Promise<CarpoolInterface> {
    throw new Error('Method not implemented.');
  }
}

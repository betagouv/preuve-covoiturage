import { TripInterface } from './TripInterface';

export interface TripRepositoryProviderInterface {
  findTripByPolicy(policy_id: number, batchSize?: number): AsyncGenerator<TripInterface[], void, void>;
  refresh(): Promise<void>;
  listApplicablePoliciesId(): Promise<number[]>;
}

export abstract class TripRepositoryProviderInterfaceResolver implements TripRepositoryProviderInterface {
  abstract async refresh(): Promise<void>;
  abstract async listApplicablePoliciesId(): Promise<number[]>;
  abstract findTripByPolicy(policy_id: number, batchSize?: number): AsyncGenerator<TripInterface[], void, void>;
}

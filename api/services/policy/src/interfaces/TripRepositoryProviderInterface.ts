import { TripInterface } from '.';
import { ProcessableCampaign } from '../engine/ProcessableCampaign';

export interface TripRepositoryProviderInterface {
  findTripByPolicy(
    policy: ProcessableCampaign,
    batchSize?: number,
    override?: boolean,
  ): AsyncGenerator<TripInterface[], void, void>;
  refresh(): Promise<void>;
  listApplicablePoliciesId(): Promise<number[]>;
}

export abstract class TripRepositoryProviderInterfaceResolver implements TripRepositoryProviderInterface {
  abstract refresh(): Promise<void>;
  abstract listApplicablePoliciesId(): Promise<number[]>;
  abstract findTripByPolicy(
    policy: ProcessableCampaign,
    batchSize?: number,
    override?: boolean,
  ): AsyncGenerator<TripInterface[], void, void>;
}

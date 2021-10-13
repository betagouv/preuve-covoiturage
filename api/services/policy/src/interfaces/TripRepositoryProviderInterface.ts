import { TripInterface } from '.';
import { ProcessableCampaign } from '../engine/ProcessableCampaign';

export interface TripRepositoryProviderInterface {
  findTripByPolicy(
    policy: ProcessableCampaign,
    batchSize?: number,
    override_from?: Date,
  ): AsyncGenerator<TripInterface[], void, void>;
  listApplicablePoliciesId(): Promise<number[]>;
}

export abstract class TripRepositoryProviderInterfaceResolver implements TripRepositoryProviderInterface {
  abstract listApplicablePoliciesId(): Promise<number[]>;
  abstract findTripByPolicy(
    policy: ProcessableCampaign,
    batchSize?: number,
    override_from?: Date,
  ): AsyncGenerator<TripInterface[], void, void>;
}

import { TripInterface } from '.';
import { ProcessableCampaign } from '../engine/ProcessableCampaign';

export interface TripRepositoryProviderInterface {
  findTripByPolicy(
    policy: ProcessableCampaign,
    from: Date,
    to: Date,
    batchSize?: number,
    override?: boolean,
  ): AsyncGenerator<TripInterface[], void, void>;
  listApplicablePoliciesId(): Promise<number[]>;
}

export abstract class TripRepositoryProviderInterfaceResolver implements TripRepositoryProviderInterface {
  abstract listApplicablePoliciesId(): Promise<number[]>;
  abstract findTripByPolicy(
    policy: ProcessableCampaign,
    from: Date,
    to: Date,
    batchSize?: number,
    override?: boolean,
  ): AsyncGenerator<TripInterface[], void, void>;
}

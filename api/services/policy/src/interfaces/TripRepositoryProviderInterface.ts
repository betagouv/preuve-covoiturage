import { CarpoolInterface, PolicyInterface } from '~/engine/interfaces';

export abstract class TripRepositoryProviderInterfaceResolver {
  abstract findTripByPolicy(
    policy: PolicyInterface,
    from: Date,
    to: Date,
    batchSize?: number,
    override?: boolean,
  ): AsyncGenerator<CarpoolInterface[], void, void>;
}

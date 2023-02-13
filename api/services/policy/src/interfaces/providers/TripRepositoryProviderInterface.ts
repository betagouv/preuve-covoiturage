import { CarpoolInterface } from '../../shared/policy/common/interfaces/CarpoolInterface';
import { PolicyInterface } from '../../shared/policy/common/interfaces/PolicyInterface';

export abstract class TripRepositoryProviderInterfaceResolver {
  abstract findTripByPolicy(
    policy: PolicyInterface,
    from: Date,
    to: Date,
    batchSize?: number,
    override?: boolean,
  ): AsyncGenerator<CarpoolInterface[], void, void>;

  abstract findTripByGeo(
    coms: string[],
    from: Date,
    to: Date,
    batchSize?: number,
    override?: boolean,
  ): AsyncGenerator<CarpoolInterface[], void, void>;
}

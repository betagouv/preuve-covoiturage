import { CarpoolInterface, PolicyInterface } from '..';

export abstract class TripRepositoryProviderInterfaceResolver {
  abstract findTripByPolicy(
    policy: PolicyInterface,
    from: Date,
    to: Date,
    batchSize?: number,
    override?: boolean,
  ): AsyncGenerator<CarpoolInterface[], void, void>;

  abstract findTripByGeo(
    insee: string,
    from: Date,
    to: Date,
    batchSize?: number,
    override?: boolean,
  ): AsyncGenerator<CarpoolInterface[], void, void>;
}

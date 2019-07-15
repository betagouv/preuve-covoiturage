import chai from 'chai';
import { Extensions } from '@ilos/core';
import { provider, NewableType, ExtensionInterface, serviceProvider } from '@ilos/common';
import { EnvExtension } from '@ilos/env';
import { ConfigExtension } from '@ilos/config';
import { ValidatorExtension } from '@pdc/provider-validator';

import { ServiceProvider as BaseServiceProvider } from '../ServiceProvider';
import { CrosscheckRepositoryProviderInterfaceResolver } from '../interfaces/repository/CrosscheckRepositoryProviderInterface';
import { TripInterface } from '../interfaces/TripInterface';
import { Person, Trip } from '../entities/Trip';
import { journey } from '../../tests/mocks/journey';
import { CrosscheckProcessAction } from './CrosscheckProcessAction';
import { trip } from '../../tests/mocks/trip';

const { expect } = chai;

@provider({
  identifier: CrosscheckRepositoryProviderInterfaceResolver,
})
class FakeCrosscheckRepository extends CrosscheckRepositoryProviderInterfaceResolver {
  async boot() {
    return;
  }
  public async create(trip: TripInterface): Promise<Trip> {
    return new Trip({ ...trip, _id: '5d08a59aeb5e79d7607d29cd' });
  }
}

@serviceProvider({
  env: null,
  config: {},
  validator: [],
  providers: [FakeCrosscheckRepository],
  handlers: [CrosscheckProcessAction],
})
class ServiceProvider extends BaseServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [
    EnvExtension,
    ConfigExtension,
    ValidatorExtension,
    Extensions.Providers,
  ];
}

describe('Crosscheck Action - process', () => {
  let sp;
  let action;

  const mockJourney = {
    ...journey,
  };

  before(async () => {
    sp = new ServiceProvider();
    await sp.register();
    await sp.init();
    action = sp.getContainer().get(CrosscheckProcessAction);
  });

  it('should create ', async () => {
    const result = await action.handle(
      {
        journey: {
          ...mockJourney,
          otherKey: 'otherValue',
        },
      },
      { call: { user: {} }, channel: { service: '' } },
    );

    expect(result).to.be.an.instanceof(Trip);
    expect(result).to.have.property('_id');
    expect(result.territory).to.eql(trip.territory);
    expect(result.status).to.eql(trip.status);
    expect(result.start).to.eql(trip.start);

    const passenger = <any>{
      ...trip.people[0],
      start: { ...trip.people[0].start },
      end: { ...trip.people[0].end },
    };

    const driver = <any>{
      ...trip.people[1],
      start: { ...trip.people[1].start },
      end: { ...trip.people[1].end },
    };

    expect(result.people[0]).to.eql(new Person(driver));
    expect(result.people[1]).to.eql(new Person(passenger));
  });
});

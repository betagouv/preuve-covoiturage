// tslint:disable max-classes-per-file
import chai from 'chai';
import { Container, Exceptions, Interfaces, Types } from '@ilos/core';
import { ValidatorProvider, ValidatorProviderInterfaceResolver } from '@pdc/provider-validator';




import { ServiceProvider as BaseServiceProvider } from '../ServiceProvider';
import {CrosscheckRepositoryProviderInterfaceResolver} from '../interfaces/repository/CrosscheckRepositoryProviderInterface';
import {journey} from '../../tests/mocks/journey';
import {TripInterface} from '../interfaces/TripInterface';
import {Trip} from '../entities/trip';
import {CrosscheckProcessAction} from './CrosscheckProcessAction';
import {ConfigProviderInterfaceResolver} from '@ilos/provider-config';

const { expect } = chai;

const mockJourney = {
  ...journey,
};


const mockTripId = '5d08a59aeb5e79d7607d29cd';

@Container.provider()
class FakeCrosscheckRepository extends CrosscheckRepositoryProviderInterfaceResolver {
  async boot() {
    return;
  }
  public async create(trip: TripInterface): Promise<Trip> {
    return new Trip({ ...trip, _id: mockTripId });
  }

}

@Container.provider()
class FakeKernelProvider extends Interfaces.KernelInterfaceResolver {
  async boot() {
    return;
  }
  async call(
    method: string,
    params: any[] | { [p: string]: any },
    context: Types.ContextType,
  ): Promise<Types.ResultType> {
    return undefined;
  }
}

@Container.provider()
class FakeConfigProvider extends ConfigProviderInterfaceResolver {
  async boot() {
    return;
  }
}

// @Container.provider()
// class FakeValidatorProvider extends ValidatorProviderInterfaceResolver{
//   async boot() {
//     return;
//   }
// }

class ServiceProvider extends BaseServiceProvider {
  readonly handlers = [CrosscheckProcessAction];
  readonly alias: any[] = [
    [ConfigProviderInterfaceResolver, FakeConfigProvider],
    [CrosscheckRepositoryProviderInterfaceResolver, FakeCrosscheckRepository],
    [Interfaces.KernelInterfaceResolver, FakeKernelProvider],
    [ValidatorProviderInterfaceResolver, ValidatorProvider],
  ];

  protected registerConfig() {}


}

let serviceProvider;
let handlers;
let action;

describe('CROSSCHECK ACTION - process', () => {
  before(async () => {
    serviceProvider = new ServiceProvider();
    await serviceProvider.boot();
    handlers = serviceProvider.getContainer().getHandlers();
    action = serviceProvider.getContainer().getHandler(handlers[0]);
  });

  it('should create ', async () => {
    const result = await action.call({
      method: 'crosscheck:process',
      context: { call: { user: {} }, channel: { service: '' } },
      params: { journey: mockJourney },
    });

    console.log({result})

    expect(result).to.eql(undefined);
  });
});

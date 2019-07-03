// tslint:disable max-classes-per-file
import chai from 'chai';
import { Container, Interfaces, Types } from '@ilos/core';
import {ConfigProviderInterfaceResolver} from '@ilos/provider-config';
import { ValidatorProviderInterfaceResolver } from '@pdc/provider-validator';

import { ServiceProvider as BaseServiceProvider } from '../ServiceProvider';

import {CrosscheckRepositoryProviderInterfaceResolver} from '../interfaces/repository/CrosscheckRepositoryProviderInterface';
import {TripInterface} from '../interfaces/TripInterface';

import {Trip} from '../entities/trip';

import {journey} from '../../tests/mocks/journey';

import {CrosscheckProcessAction} from './CrosscheckProcessAction';


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

@Container.provider()
class FakeValidatorProvider extends ValidatorProviderInterfaceResolver{
  async boot() {
    return;
  }
}

class ServiceProvider extends BaseServiceProvider {
  readonly handlers = [CrosscheckProcessAction];
  readonly alias: any[] = [
    [ConfigProviderInterfaceResolver, FakeConfigProvider],
    [CrosscheckRepositoryProviderInterfaceResolver, FakeCrosscheckRepository],
    [Interfaces.KernelInterfaceResolver, FakeKernelProvider],
    [ValidatorProviderInterfaceResolver, FakeValidatorProvider],
  ];

  protected registerConfig() {
  }

  protected registerValidators() {
  }
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

    expect(result).to.be.an.instanceof(Trip);
  });
});

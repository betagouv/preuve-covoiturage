import {
  RegisterHookInterface,
  InitHookInterface,
  ServiceContainerInterface,
  ValidatorInterfaceResolver,
} from '@ilos/common';

import { GeoProviderInterfaceResolver } from './interfaces/GeoProviderInterface';
import { GeoProvider } from './GeoProvider';

export class GeoProviderExtension implements RegisterHookInterface, InitHookInterface {
  static readonly key: string = 'geo';

  protected readonly validators: [string, any][] = [
    [
      'position',
      {
        $id: 'position',
        type: 'object',
        additionalProperties: false,
        minProperties: 1,
        dependencies: {
          lon: ['lat'],
          lat: ['lon'],
        },
        properties: {
          lat: { macro: 'lat' },
          lon: { macro: 'lon' },
          insee: { macro: 'insee' },
          literal: { macro: 'longchar' },
        },
      },
    ],
  ];

  constructor(protected needed: boolean) {
    //
  }
  public async register(serviceContainer: ServiceContainerInterface) {
    const container = serviceContainer.getContainer();
    container.bind(GeoProviderInterfaceResolver).to(GeoProvider);
  }

  public async init(serviceContainer: ServiceContainerInterface) {
    const container = serviceContainer.getContainer();

    // register validators
    const validator = container.get(ValidatorInterfaceResolver);
    this.validators.forEach(([name, schema]) => {
      validator.registerValidator(schema, name);
    });
  }
}

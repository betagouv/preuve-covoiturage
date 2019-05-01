import { ContainerInterface } from '~/Container';

import { ProviderInterface } from './ProviderInterface';
import { NewableType } from '../types/NewableType';

export interface ServiceProviderInterface extends ProviderInterface {
  readonly alias: any[];
  readonly serviceProviders: NewableType<ServiceProviderInterface>[];

  getContainer():ContainerInterface;
}

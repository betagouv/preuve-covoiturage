import { KernelInterface, ServiceContainerInterface } from '../core';
import { TransportInterface } from '../transport';
import { NewableType } from '../shared';

export type BootstrapType = {
  serviceProviders?: NewableType<ServiceContainerInterface>[];
  transport?: {
    [key: string]: (kernel: KernelInterface) => TransportInterface;
  };
  kernel?(): NewableType<KernelInterface>;
};

import { KernelInterface, ServiceContainerInterface } from '../core/index.ts';
import { TransportInterface } from '../transport/index.ts';
import { NewableType } from '../shared/index.ts';

export type BootstrapType = {
  serviceProviders?: NewableType<ServiceContainerInterface>[];
  transport?: {
    [key: string]: (kernel: KernelInterface) => TransportInterface;
  };
  kernel?(): NewableType<KernelInterface>;
};

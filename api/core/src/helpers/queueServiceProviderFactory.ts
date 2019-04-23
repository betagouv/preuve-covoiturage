import { QueueProvider } from '../serviceProviders/QueueProvider';
import { ServiceProviderConstructorInterface } from '../interfaces/ServiceProviderConstructorInterface';

export function queueServiceProviderFactory(signature: string, version?: string): ServiceProviderConstructorInterface {
  return class extends QueueProvider {
    readonly signature: string = signature;
    readonly version: string = version;
  };
}

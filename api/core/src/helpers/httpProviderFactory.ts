import { HttpProvider } from '../providers/HttpProvider';
import { ServiceProviderConstructorInterface } from '../interfaces/ServiceProviderConstructorInterface';

export function httpProviderFactory(signature: string, url: string, version?: string): ServiceProviderConstructorInterface {
  return class extends HttpProvider {
    readonly signature: string = signature;
    readonly version: string = version;
    protected readonly url: string = url;
  };
}

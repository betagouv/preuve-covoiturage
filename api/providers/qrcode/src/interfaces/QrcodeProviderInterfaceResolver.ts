import { ProviderInterface } from '@ilos/common';

export interface QrcodeProviderInterface extends ProviderInterface {
  svg(url: string): string;
}

export abstract class QrcodeProviderInterfaceResolver implements QrcodeProviderInterface {
  svg(url: string): string {
    throw new Error('Not implemented');
  }
}

import { ProviderInterface } from '@ilos/common/index.ts';

export interface QrcodeProviderInterface extends ProviderInterface {
  svgPath(url: string): string;
  svg(url: string): string;
}

export abstract class QrcodeProviderInterfaceResolver implements QrcodeProviderInterface {
  svgPath(url: string): string {
    throw new Error('Not implemented');
  }
  svg(url: string): string {
    throw new Error('Not implemented');
  }
}

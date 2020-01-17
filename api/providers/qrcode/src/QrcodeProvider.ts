import { QRCode } from './lib/QRCode';
import { provider } from '@ilos/common';

import { QrcodeProviderInterface, QrcodeProviderInterfaceResolver } from './interfaces/QrcodeProviderInterfaceResolver';

/**
 * QRCode SVG is a library by papnkukn
 * Documentation: https://papnkukn.github.io/qrcode-svg/
 *
 * It has been (really quickly) converted to Typescript and split into multiple files
 */

@provider({
  identifier: QrcodeProviderInterfaceResolver,
})
export class QrcodeProvider implements QrcodeProviderInterface {
  svg(url: string): string {
    return new QRCode({
      content: url,
      padding: 0,
      width: 256,
      height: 256,
    }).svg();
  }
}

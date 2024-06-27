import { QRCode } from "./lib/QRCode.ts";
import { provider } from "@/ilos/common/index.ts";

import {
  QrcodeProviderInterface,
  QrcodeProviderInterfaceResolver,
} from "./interfaces/QrcodeProviderInterfaceResolver.ts";

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
  svgPath(url: string): string {
    const svg: string = new QRCode({
      join: true,
      content: url,
      padding: 0,
      width: 256,
      height: 256,
    }).svg();

    return svg.substr(svg.indexOf('crispEdges;" d="') + 16).replace(
      ' " /></svg>',
      "",
    );
  }

  svg(url: string): string {
    return new QRCode({
      content: url,
      padding: 0,
      width: 256,
      height: 256,
    }).svg();
  }
}

import axios from 'axios';
import { provider, ConfigInterfaceResolver } from '@ilos/common';

import {
  HtmlPrinterProviderInterface,
  HtmlPrinterProviderInterfaceResolver,
} from '../interfaces/HtmlPrinterProviderInterface';
import { TokenProviderInterfaceResolver } from '@pdc/provider-token/dist';

@provider({
  identifier: HtmlPrinterProviderInterfaceResolver,
})
export class HtmlPrinterProvider implements HtmlPrinterProviderInterface {
  constructor(private config: ConfigInterfaceResolver, private tokenProvider: TokenProviderInterfaceResolver) {}

  async png(uuid: string): Promise<Buffer> {
    return this.call(uuid, 'png');
  }

  async pdf(uuid: string): Promise<Buffer> {
    return this.call(uuid, 'pdf');
  }

  private async call(uuid: string, type: string): Promise<Buffer> {
    const response = await axios.post(
      `${this.config.get('url.printerUrl')}/print`,
      {
        uuid,
        api: this.config.get('url.apiUrl'),
        token: await this.getJwtToken(uuid),
      },
      {
        responseType: 'arraybuffer',
        headers: {
          Accept: type === 'png' ? 'image/png' : 'application/pdf',
          Authorization: `Bearer ${this.config.get('token.render.bearer')}`,
        },
      },
    );

    return response.data;
  }

  private async getJwtToken(uuid: string): Promise<string> {
    return this.tokenProvider.sign(
      { uuid },
      {
        issuer: this.config.get('token.render.issuer'),
        audience: this.config.get('token.render.audience'),
      },
    );
  }
}

import { Action as AbstractAction } from '@ilos/core';
import { handler, ConfigInterfaceResolver, UnauthorizedException } from '@ilos/common';
import { DateProviderInterfaceResolver } from '@pdc/provider-date';
import { QrcodeProviderInterfaceResolver } from '@pdc/provider-qrcode';
import { TokenProviderInterfaceResolver } from '@pdc/provider-token';
import { TemplateInterfaceResolver } from '@pdc/provider-template';

import { CertificateRepositoryProviderInterfaceResolver } from '../interfaces/CertificateRepositoryProviderInterface';
import { RenderTokenPayloadInterface } from '../shared/certificate/common/interfaces/RenderTokenPayloadInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/certificate/render.contract';
import { alias } from '../shared/certificate/render.schema';

@handler({ ...handlerConfig, middlewares: [['validate', alias]] })
export class RenderCertificateAction extends AbstractAction {
  constructor(
    private certRepository: CertificateRepositoryProviderInterfaceResolver,
    private templateProvider: TemplateInterfaceResolver,
    private dateProvider: DateProviderInterfaceResolver,
    private qrcodeProvider: QrcodeProviderInterfaceResolver,
    private tokenProvider: TokenProviderInterfaceResolver,
    private config: ConfigInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    //// TODO : MOVE THIS TO MIDDLEWARE
    // validate token
    try {
      const payload = await this.tokenProvider.verify<RenderTokenPayloadInterface>(params.token, {
        issuer: this.config.get('token.render.issuer'),
        audience: this.config.get('token.render.audience'),
        ignoreExpiration: true,
      });

      // make sure the token has been issued for this certificate
      if (payload.uuid !== params.uuid) {
        throw new Error('Token not matching the certificate');
      }
    } catch (e) {
      throw new UnauthorizedException(e.message);
    }
    //// END TODO

    const certificate = await this.certRepository.findByUuid(params.uuid);

    // fetch template metadata
    const templateMeta = this.templateProvider.getMetadata('certificate');

    // build the validation URL and QR-code
    const validationUrl = `${templateMeta.validation.url}/${certificate.uuid}`;

    // ...or render the HTML document
    return {
      type: 'text/html',
      code: 200,
      params,
      data: this.templateProvider.get('certificate', {
        data: certificate.meta,
        identity: certificate.identity_uuid,
        operator: certificate.operator_uuid,
        territory: certificate.territory_uuid,
        certificate: {
          created_at: this.dateProvider.format(certificate.created_at, 'd MMMM yyyy à k:m'),
          start_at: this.dateProvider.format(certificate.start_at, 'd MMMM yyyy'),
          end_at: this.dateProvider.format(certificate.end_at, 'd MMMM yyyy'),
        },
        meta: templateMeta,
        validation: {
          url: validationUrl,
          qrcode: this.qrcodeProvider.svg(validationUrl),
        },
      }),
    };
  }
}

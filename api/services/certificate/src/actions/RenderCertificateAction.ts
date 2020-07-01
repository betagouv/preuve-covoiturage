import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { DateProviderInterfaceResolver } from '@pdc/provider-date';
import { QrcodeProviderInterfaceResolver } from '@pdc/provider-qrcode';
import { TemplateInterfaceResolver } from '@pdc/provider-template';

import { CertificateRepositoryProviderInterfaceResolver } from '../interfaces/CertificateRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/certificate/render.contract';
import { alias } from '../shared/certificate/render.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    ['can', ['certificate.render']],
    ['channel.service.only', ['proxy']],
  ],
})
export class RenderCertificateAction extends AbstractAction {
  constructor(
    private certRepository: CertificateRepositoryProviderInterfaceResolver,
    private templateProvider: TemplateInterfaceResolver,
    private dateProvider: DateProviderInterfaceResolver,
    private qrcodeProvider: QrcodeProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
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
        identity: certificate.meta.identity.uuid,
        operator: certificate.meta.operator.uuid,
        territory: certificate.meta.territory?.uuid,
        certificate: {
          created_at: `le ${this.dateProvider.format(certificate.created_at, 'd MMMM yyyy à kk:mm', {
            timeZone: certificate.meta.tz,
          })}`.replace(':', 'h'),
          start_at: this.dateProvider.format(certificate.start_at, 'd MMMM yyyy', {
            timeZone: certificate.meta.tz,
          }),
          end_at: this.dateProvider.format(certificate.end_at, 'd MMMM yyyy', {
            timeZone: certificate.meta.tz,
          }),
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

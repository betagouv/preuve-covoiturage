import { get, set } from 'lodash';

import { Action as AbstractAction } from '@ilos/core';
import { handler, ConfigInterfaceResolver } from '@ilos/common';
import { DateProviderInterfaceResolver } from '@pdc/provider-date';
import { QrcodeProviderInterfaceResolver } from '@pdc/provider-qrcode';
import { PdfCertProviderInterfaceResolver } from '@pdc/provider-pdfcert';

// import { HtmlPrinterProviderInterfaceResolver } from '../interfaces/HtmlPrinterProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/certificate/download.contract';
import { alias } from '../shared/certificate/download.schema';
import { CertificateRepositoryProviderInterfaceResolver } from '../interfaces/CertificateRepositoryProviderInterface';

@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    ['can', ['certificate.download']],
    ['channel.service.only', ['proxy']],
  ],
})
export class DownloadCertificateAction extends AbstractAction {
  constructor(
    private config: ConfigInterfaceResolver,
    private pdfCert: PdfCertProviderInterfaceResolver,
    private dateProvider: DateProviderInterfaceResolver,
    private certRepository: CertificateRepositoryProviderInterfaceResolver,
    private qrcodeProvider: QrcodeProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    const certificate = await this.certRepository.findByUuid(params.uuid);
    const validationUrl = `${this.config.get('templates.certificate.validation.url')}/${params.uuid}`;

    const data = {
      title: this.config.get('templates.certificate.title', 'Attestation de covoiturage'),
      data: certificate.meta,
      identity: certificate.meta.identity.uuid.toUpperCase(),
      operator: certificate.meta.operator.uuid.toUpperCase(),
      territory: certificate.meta.territory?.uuid.toUpperCase(),
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
      validation: {
        url: validationUrl,
        qrcode: this.qrcodeProvider.svgPath(validationUrl),
      },
      header: {
        operator: {
          name: certificate.meta.operator.name,
          image: certificate.meta.operator.thumbnail,
        },
      },
    };

    // set header content
    if (get(params, 'meta.operator.content')) {
      set(data, 'header.operator.content', get(params, 'meta.operator.content'));
    }
    if (get(params, 'meta.identity.name')) {
      set(data, 'header.identity.name', get(params, 'meta.identity.name'));
    }
    if (get(params, 'meta.identity.content')) {
      set(data, 'header.identity.content', get(params, 'meta.identity.content'));
    }
    if (get(params, 'meta.notes')) {
      set(data, 'header.notes', get(params, 'meta.notes'));
    }

    return {
      body: await this.pdfCert.pdf(data),
      headers: {
        'Content-type': 'application/pdf',
        'Content-disposition': `attachment; filename=covoiturage-${params.uuid}.pdf`,
      },
    };
  }
}

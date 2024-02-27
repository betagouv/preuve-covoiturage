import { ConfigInterfaceResolver, handler, InvalidParamsException, KernelInterfaceResolver } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { DateProviderInterfaceResolver } from '@pdc/providers/date';
import {
  channelServiceWhitelistMiddleware,
  copyGroupIdAndApplyGroupPermissionMiddlewares,
} from '@pdc/providers/middleware';
import { PdfCertProviderInterfaceResolver, PdfTemplateData } from '@pdc/providers/pdfcert';
import { QrcodeProviderInterfaceResolver } from '@pdc/providers/qrcode';
import { get, set } from 'lodash';
import { CertificateRepositoryProviderInterfaceResolver } from '../interfaces/CertificateRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '@shared/certificate/download.contract';
import { alias } from '@shared/certificate/download.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      operator: 'operator.certificate.download',
      registry: 'registry.certificate.download',
    }),
    channelServiceWhitelistMiddleware('proxy'),
    ['validate', alias],
  ],
})
export class DownloadCertificateAction extends AbstractAction {
  constructor(
    private kernel: KernelInterfaceResolver,
    private config: ConfigInterfaceResolver,
    private pdfCert: PdfCertProviderInterfaceResolver,
    private dateProvider: DateProviderInterfaceResolver,
    private certRepository: CertificateRepositoryProviderInterfaceResolver,
    private qrcodeProvider: QrcodeProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    if (!params.operator_id) {
      throw new InvalidParamsException('operator_id must be set in the payload if you are connected as super admin');
    }

    const certificate = await this.certRepository.findByUuid(params.uuid, params.operator_id);
    const thumbnail = await this.getThumbnailBase64(certificate.operator_id);
    const validationUrl = `${this.config.get('templates.certificate.validation.url')}/${params.uuid}`;

    const data: PdfTemplateData = {
      title: this.config.get('templates.certificate.title', 'Attestation de covoiturage'),
      data: certificate.meta,
      identity: certificate.meta.identity.uuid.toUpperCase(),
      operator: certificate.meta.operator.uuid.toUpperCase(),
      support: certificate.meta.operator.support || this.config.get('templates.certificate.support'),
      certificate: {
        uuid: certificate.uuid.toUpperCase(),
        created_at: `${this.dateProvider.format(certificate.created_at, 'd MMMM yyyy à kk:mm', {
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
          image: thumbnail,
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

  private async getThumbnailBase64(operator_id: number): Promise<string | null> {
    const operator = await this.kernel.call(
      'operator:quickfind',
      { _id: operator_id, thumbnail: true },
      {
        channel: { service: 'certificate' },
        call: { user: { permissions: ['common.operator.find'] } },
      },
    );

    return operator.thumbnail;
  }
}

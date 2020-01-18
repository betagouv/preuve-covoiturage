import { upperFirst } from 'lodash';
import { Action as AbstractAction } from '@ilos/core';
import { handler, TemplateInterfaceResolver } from '@ilos/common';
import { DateProviderInterfaceResolver } from '@pdc/provider-date';
import { QrcodeProviderInterfaceResolver } from '@pdc/provider-qrcode';

import { CertificateRepositoryProviderInterfaceResolver } from '../interfaces/CertificateRepositoryProviderInterface';
import { CarpoolRepositoryProviderInterfaceResolver } from '../interfaces/CarpoolRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/certificate/render.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { alias } from '../shared/certificate/render.schema';

@handler(handlerConfig)
export class RenderCertificateAction extends AbstractAction {
  // public readonly middlewares: ActionMiddleware[] = [['can', ['certificate.render']], ['validate', alias]];
  public readonly middlewares: ActionMiddleware[] = [['validate', alias]];

  constructor(
    private certRepository: CertificateRepositoryProviderInterfaceResolver,
    private carpoolRepository: CarpoolRepositoryProviderInterfaceResolver,
    private templateProvider: TemplateInterfaceResolver,
    private dateProvider: DateProviderInterfaceResolver,
    private qrcodeProvider: QrcodeProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    // TODO find a better way to cast input before calling the action
    params = this.castParams(params);

    const identity = { uuid: 'b409aa51-dee8-4276-9dde-b55d3fd0c7e9' };
    const operator = { uuid: 'c5b07e35-651e-4688-b0b7-2811073bfcf3', name: 'Mobicops' };
    const territory = { uuid: '4b5b1de9-6a06-4ed7-b405-c9141a7437d6', name: 'Paris Ile-de-France' };

    // fetch the data for this identity, operator and territory and map to template object
    const rows = await this.carpoolRepository.find(params);
    const meta = {
      rows: rows.map((line, index) => ({
        index,
        month: upperFirst(this.dateProvider.format(new Date(`${line.y}-${line.m}-01`), 'MMMM yyyy')),
        distance: line.km | 0,
      })),
      total_km: Math.round(rows.reduce((sum: number, line): number => line.km + sum, 0)),
      total_point: 0,
      total_cost: 0,
      remaining: 0,
    };

    // store the certificate
    const certificate = await this.certRepository.create({
      meta,
      identity_id: identity.uuid,
      operator_id: identity.uuid,
      territory_id: identity.uuid,
      start_at: params.start_at,
      end_at: params.end_at,
    });

    // return the JSON object...
    if (params.type === 'json') {
      return {
        type: 'application/json',
        code: 200,
        params,
        data: rows,
      };
    }

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
        data: meta,
        identity,
        operator,
        territory,
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

  private castParams(params: ParamsInterface): ParamsInterface {
    // TODO check for automatic casting
    params.start_at = new Date(params.start_at);
    params.end_at = new Date(params.end_at);

    // normalize dates
    if (!params.end_at || params.end_at.getTime() > new Date().getTime()) {
      params.end_at = new Date();
    }

    if (!params.start_at || params.start_at.getTime() >= params.end_at.getTime()) {
      params.start_at = new Date('2018-01-01T00:00:00+0100');
    }

    return params;
  }
}

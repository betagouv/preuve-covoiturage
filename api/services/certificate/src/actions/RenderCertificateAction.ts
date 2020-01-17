import { upperFirst } from 'lodash';
import { Action as AbstractAction } from '@ilos/core';
import { handler, TemplateInterfaceResolver } from '@ilos/common';
import { DateProviderInterfaceResolver } from '@pdc/provider-date';

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
          qrcode: `
          <svg class="qr-code" version="1.1" baseProfile="full" width="232" height="232" viewBox="0 0 232 232"
          xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
          xmlns:ev="http://www.w3.org/2001/xml-events">
          <desc></desc>
          <rect width="232" height="232" fill="#ffffff" cx="0" cy="0" />
          <defs>
            <rect id="p" width="8" height="8" />
          </defs>
          <g fill="#000000">
            <use x="32" y="32" xlink:href="#p" />
            <use x="32" y="40" xlink:href="#p" />
            <use x="32" y="48" xlink:href="#p" />
            <use x="32" y="56" xlink:href="#p" />
            <use x="32" y="64" xlink:href="#p" />
            <use x="32" y="72" xlink:href="#p" />
            <use x="32" y="80" xlink:href="#p" />
            <use x="32" y="96" xlink:href="#p" />
            <use x="32" y="120" xlink:href="#p" />
            <use x="32" y="144" xlink:href="#p" />
            <use x="32" y="152" xlink:href="#p" />
            <use x="32" y="160" xlink:href="#p" />
            <use x="32" y="168" xlink:href="#p" />
            <use x="32" y="176" xlink:href="#p" />
            <use x="32" y="184" xlink:href="#p" />
            <use x="32" y="192" xlink:href="#p" />
            <use x="40" y="32" xlink:href="#p" />
            <use x="40" y="80" xlink:href="#p" />
            <use x="40" y="96" xlink:href="#p" />
            <use x="40" y="120" xlink:href="#p" />
            <use x="40" y="128" xlink:href="#p" />
            <use x="40" y="144" xlink:href="#p" />
            <use x="40" y="192" xlink:href="#p" />
            <use x="48" y="32" xlink:href="#p" />
            <use x="48" y="48" xlink:href="#p" />
            <use x="48" y="56" xlink:href="#p" />
            <use x="48" y="64" xlink:href="#p" />
            <use x="48" y="80" xlink:href="#p" />
            <use x="48" y="96" xlink:href="#p" />
            <use x="48" y="112" xlink:href="#p" />
            <use x="48" y="144" xlink:href="#p" />
            <use x="48" y="160" xlink:href="#p" />
            <use x="48" y="168" xlink:href="#p" />
            <use x="48" y="176" xlink:href="#p" />
            <use x="48" y="192" xlink:href="#p" />
            <use x="56" y="32" xlink:href="#p" />
            <use x="56" y="48" xlink:href="#p" />
            <use x="56" y="56" xlink:href="#p" />
            <use x="56" y="64" xlink:href="#p" />
            <use x="56" y="80" xlink:href="#p" />
            <use x="56" y="96" xlink:href="#p" />
            <use x="56" y="120" xlink:href="#p" />
            <use x="56" y="144" xlink:href="#p" />
            <use x="56" y="160" xlink:href="#p" />
            <use x="56" y="168" xlink:href="#p" />
            <use x="56" y="176" xlink:href="#p" />
            <use x="56" y="192" xlink:href="#p" />
            <use x="64" y="32" xlink:href="#p" />
            <use x="64" y="48" xlink:href="#p" />
            <use x="64" y="56" xlink:href="#p" />
            <use x="64" y="64" xlink:href="#p" />
            <use x="64" y="80" xlink:href="#p" />
            <use x="64" y="112" xlink:href="#p" />
            <use x="64" y="144" xlink:href="#p" />
            <use x="64" y="160" xlink:href="#p" />
            <use x="64" y="168" xlink:href="#p" />
            <use x="64" y="176" xlink:href="#p" />
            <use x="64" y="192" xlink:href="#p" />
            <use x="72" y="32" xlink:href="#p" />
            <use x="72" y="80" xlink:href="#p" />
            <use x="72" y="104" xlink:href="#p" />
            <use x="72" y="128" xlink:href="#p" />
            <use x="72" y="144" xlink:href="#p" />
            <use x="72" y="192" xlink:href="#p" />
            <use x="80" y="32" xlink:href="#p" />
            <use x="80" y="40" xlink:href="#p" />
            <use x="80" y="48" xlink:href="#p" />
            <use x="80" y="56" xlink:href="#p" />
            <use x="80" y="64" xlink:href="#p" />
            <use x="80" y="72" xlink:href="#p" />
            <use x="80" y="80" xlink:href="#p" />
            <use x="80" y="96" xlink:href="#p" />
            <use x="80" y="112" xlink:href="#p" />
            <use x="80" y="128" xlink:href="#p" />
            <use x="80" y="144" xlink:href="#p" />
            <use x="80" y="152" xlink:href="#p" />
            <use x="80" y="160" xlink:href="#p" />
            <use x="80" y="168" xlink:href="#p" />
            <use x="80" y="176" xlink:href="#p" />
            <use x="80" y="184" xlink:href="#p" />
            <use x="80" y="192" xlink:href="#p" />
            <use x="88" y="104" xlink:href="#p" />
            <use x="88" y="112" xlink:href="#p" />
            <use x="88" y="120" xlink:href="#p" />
            <use x="88" y="128" xlink:href="#p" />
            <use x="96" y="32" xlink:href="#p" />
            <use x="96" y="48" xlink:href="#p" />
            <use x="96" y="56" xlink:href="#p" />
            <use x="96" y="64" xlink:href="#p" />
            <use x="96" y="80" xlink:href="#p" />
            <use x="96" y="96" xlink:href="#p" />
            <use x="96" y="120" xlink:href="#p" />
            <use x="96" y="136" xlink:href="#p" />
            <use x="96" y="168" xlink:href="#p" />
            <use x="96" y="176" xlink:href="#p" />
            <use x="96" y="184" xlink:href="#p" />
            <use x="96" y="192" xlink:href="#p" />
            <use x="104" y="48" xlink:href="#p" />
            <use x="104" y="56" xlink:href="#p" />
            <use x="104" y="72" xlink:href="#p" />
            <use x="104" y="96" xlink:href="#p" />
            <use x="104" y="112" xlink:href="#p" />
            <use x="104" y="128" xlink:href="#p" />
            <use x="104" y="184" xlink:href="#p" />
            <use x="104" y="192" xlink:href="#p" />
            <use x="112" y="32" xlink:href="#p" />
            <use x="112" y="40" xlink:href="#p" />
            <use x="112" y="72" xlink:href="#p" />
            <use x="112" y="80" xlink:href="#p" />
            <use x="112" y="96" xlink:href="#p" />
            <use x="112" y="104" xlink:href="#p" />
            <use x="112" y="128" xlink:href="#p" />
            <use x="112" y="136" xlink:href="#p" />
            <use x="112" y="152" xlink:href="#p" />
            <use x="112" y="176" xlink:href="#p" />
            <use x="120" y="32" xlink:href="#p" />
            <use x="120" y="40" xlink:href="#p" />
            <use x="120" y="48" xlink:href="#p" />
            <use x="120" y="64" xlink:href="#p" />
            <use x="120" y="72" xlink:href="#p" />
            <use x="120" y="88" xlink:href="#p" />
            <use x="120" y="96" xlink:href="#p" />
            <use x="120" y="104" xlink:href="#p" />
            <use x="120" y="112" xlink:href="#p" />
            <use x="120" y="120" xlink:href="#p" />
            <use x="120" y="136" xlink:href="#p" />
            <use x="120" y="144" xlink:href="#p" />
            <use x="120" y="168" xlink:href="#p" />
            <use x="128" y="32" xlink:href="#p" />
            <use x="128" y="56" xlink:href="#p" />
            <use x="128" y="72" xlink:href="#p" />
            <use x="128" y="80" xlink:href="#p" />
            <use x="128" y="88" xlink:href="#p" />
            <use x="128" y="96" xlink:href="#p" />
            <use x="128" y="104" xlink:href="#p" />
            <use x="128" y="128" xlink:href="#p" />
            <use x="128" y="144" xlink:href="#p" />
            <use x="128" y="160" xlink:href="#p" />
            <use x="128" y="176" xlink:href="#p" />
            <use x="136" y="96" xlink:href="#p" />
            <use x="136" y="104" xlink:href="#p" />
            <use x="136" y="160" xlink:href="#p" />
            <use x="136" y="184" xlink:href="#p" />
            <use x="136" y="192" xlink:href="#p" />
            <use x="144" y="32" xlink:href="#p" />
            <use x="144" y="40" xlink:href="#p" />
            <use x="144" y="48" xlink:href="#p" />
            <use x="144" y="56" xlink:href="#p" />
            <use x="144" y="64" xlink:href="#p" />
            <use x="144" y="72" xlink:href="#p" />
            <use x="144" y="80" xlink:href="#p" />
            <use x="144" y="104" xlink:href="#p" />
            <use x="144" y="120" xlink:href="#p" />
            <use x="144" y="136" xlink:href="#p" />
            <use x="144" y="160" xlink:href="#p" />
            <use x="144" y="168" xlink:href="#p" />
            <use x="144" y="176" xlink:href="#p" />
            <use x="152" y="32" xlink:href="#p" />
            <use x="152" y="80" xlink:href="#p" />
            <use x="152" y="104" xlink:href="#p" />
            <use x="152" y="120" xlink:href="#p" />
            <use x="152" y="144" xlink:href="#p" />
            <use x="152" y="152" xlink:href="#p" />
            <use x="152" y="160" xlink:href="#p" />
            <use x="152" y="184" xlink:href="#p" />
            <use x="152" y="192" xlink:href="#p" />
            <use x="160" y="32" xlink:href="#p" />
            <use x="160" y="48" xlink:href="#p" />
            <use x="160" y="56" xlink:href="#p" />
            <use x="160" y="64" xlink:href="#p" />
            <use x="160" y="80" xlink:href="#p" />
            <use x="160" y="96" xlink:href="#p" />
            <use x="160" y="120" xlink:href="#p" />
            <use x="160" y="136" xlink:href="#p" />
            <use x="160" y="144" xlink:href="#p" />
            <use x="160" y="184" xlink:href="#p" />
            <use x="168" y="32" xlink:href="#p" />
            <use x="168" y="48" xlink:href="#p" />
            <use x="168" y="56" xlink:href="#p" />
            <use x="168" y="64" xlink:href="#p" />
            <use x="168" y="80" xlink:href="#p" />
            <use x="168" y="96" xlink:href="#p" />
            <use x="168" y="112" xlink:href="#p" />
            <use x="168" y="144" xlink:href="#p" />
            <use x="168" y="152" xlink:href="#p" />
            <use x="168" y="160" xlink:href="#p" />
            <use x="168" y="176" xlink:href="#p" />
            <use x="176" y="32" xlink:href="#p" />
            <use x="176" y="48" xlink:href="#p" />
            <use x="176" y="56" xlink:href="#p" />
            <use x="176" y="64" xlink:href="#p" />
            <use x="176" y="80" xlink:href="#p" />
            <use x="176" y="96" xlink:href="#p" />
            <use x="176" y="104" xlink:href="#p" />
            <use x="176" y="112" xlink:href="#p" />
            <use x="176" y="136" xlink:href="#p" />
            <use x="176" y="152" xlink:href="#p" />
            <use x="176" y="160" xlink:href="#p" />
            <use x="176" y="192" xlink:href="#p" />
            <use x="184" y="32" xlink:href="#p" />
            <use x="184" y="80" xlink:href="#p" />
            <use x="184" y="104" xlink:href="#p" />
            <use x="184" y="112" xlink:href="#p" />
            <use x="184" y="136" xlink:href="#p" />
            <use x="184" y="152" xlink:href="#p" />
            <use x="184" y="160" xlink:href="#p" />
            <use x="184" y="168" xlink:href="#p" />
            <use x="192" y="32" xlink:href="#p" />
            <use x="192" y="40" xlink:href="#p" />
            <use x="192" y="48" xlink:href="#p" />
            <use x="192" y="56" xlink:href="#p" />
            <use x="192" y="64" xlink:href="#p" />
            <use x="192" y="72" xlink:href="#p" />
            <use x="192" y="80" xlink:href="#p" />
            <use x="192" y="96" xlink:href="#p" />
            <use x="192" y="104" xlink:href="#p" />
            <use x="192" y="112" xlink:href="#p" />
            <use x="192" y="152" xlink:href="#p" />
            <use x="192" y="160" xlink:href="#p" />
            <use x="192" y="184" xlink:href="#p" />
          </g>
        </svg>
          `,
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

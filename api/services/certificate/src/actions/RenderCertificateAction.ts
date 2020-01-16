import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType, TemplateInterfaceResolver } from '@ilos/common';

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
  ) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    // console.log('render', { params });

    const data = await this.carpoolRepository.find(params);
    // console.log({ data });

    // carpoolRepository.find(operator_user_id, start_at, end_at)
    const meta = {
      total_km: 1000,
      total_point: 2000,
      total_cost: 34293,
      remaining: 12333,
      data: [
        {
          index: 0,
          month: 12,
          sum: 112,
          unit: 'km',
        },
        {
          index: 1,
          month: 11,
          sum: 234,
          unit: 'km',
        },
        {
          index: 2,
          month: 10,
          sum: 83,
          unit: 'km',
        },
        {
          index: 3,
          month: 9,
          sum: 312,
          unit: 'km',
        },
        {
          index: 4,
          month: 8,
          sum: 198,
          unit: 'km',
        },
        {
          index: 5,
          month: 7,
          sum: 423,
          unit: 'km',
        },
      ],
    };

    // store the certificate
    await this.certRepository.create({
      meta,
      identity_id: 'c37b7a3a-4a93-4b05-8751-d502efd2d245',
      operator_id: 'c91cfb80-afcb-4c1d-ba12-103da7c8bb2e',
      territory_id: '1327eafd-9a9c-44f5-84b6-bac6c6c77dda',
      start_at: params.start_at || new Date('2018-01-01T00:00:00+0100'),
      end_at: params.end_at || new Date(),
    });

    // return the JSON object or render the HTML document
    if (params.type === 'json') {
      return {
        type: 'application/json',
        code: 200,
        params,
        data,
      };
    }

    return {
      type: 'text/html',
      code: 200,
      params,
      data: this.templateProvider.get('certificate', {
        data,
        identity: { uuid: 'b409aa51-dee8-4276-9dde-b55d3fd0c7e9' },
        operator: { uuid: 'c5b07e35-651e-4688-b0b7-2811073bfcf3' },
        territory: { uuid: '4b5b1de9-6a06-4ed7-b405-c9141a7437d6' },
        meta: this.templateProvider.getMetadata('certificate'),
        qr: {
          svg: `
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
}

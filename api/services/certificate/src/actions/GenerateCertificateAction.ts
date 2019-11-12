import fs from 'fs';
import path from 'path';
import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';

import { CertificateRepositoryProviderInterfaceResolver } from '../interfaces/CertificateRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/certificate/generate.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { alias } from '../shared/certificate/generate.schema';

@handler(handlerConfig)
export class GenerateCertificateAction extends AbstractAction {
  // public readonly middlewares: ActionMiddleware[] = [['can', ['certificate.generate']], ['validate', alias]];
  public readonly middlewares: ActionMiddleware[] = [['validate', alias]];

  constructor(private certRepository: CertificateRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    // carpool.find(operator_user_id, start_at, end_at)
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
    const cert = await this.certRepository.create({
      meta,
      identity_id: 'c37b7a3a-4a93-4b05-8751-d502efd2d245',
      operator_id: 'c91cfb80-afcb-4c1d-ba12-103da7c8bb2e',
      territory_id: '1327eafd-9a9c-44f5-84b6-bac6c6c77dda',
      start_at: params.start_at,
      end_at: params.end_at,
    });

    // return HTML / JSON
    return fs.readFileSync(path.resolve(__dirname, '../templates/certificate.html'), { encoding: 'utf8' });
  }
}

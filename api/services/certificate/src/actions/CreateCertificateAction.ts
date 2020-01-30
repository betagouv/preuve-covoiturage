/* eslint-disable */
import { upperFirst } from 'lodash';
import { Action as AbstractAction } from '@ilos/core';
import { handler, KernelInterfaceResolver, ContextType, TemplateInterfaceResolver } from '@ilos/common';

import { handlerConfig, ParamsInterface } from '../shared/certificate/create.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { alias } from '../shared/certificate/create.schema';
import { castParams } from '../utils/castParams';
import { CertificateRepositoryProviderInterfaceResolver } from '../interfaces/CertificateRepositoryProviderInterface';
import { CarpoolRepositoryProviderInterfaceResolver } from '../interfaces/CarpoolRepositoryProviderInterface';
import { DateProviderInterfaceResolver } from '@pdc/provider-date/dist';
import { QrcodeProviderInterfaceResolver } from '@pdc/provider-qrcode/dist';

@handler(handlerConfig)
export class CreateCertificateAction extends AbstractAction {
  // public readonly middlewares: ActionMiddleware[] = [['can', ['certificate.create']], ['validate', alias]];
  public readonly middlewares: ActionMiddleware[] = [['validate', alias]];

  constructor(
    private certRepository: CertificateRepositoryProviderInterfaceResolver,
    private carpoolRepository: CarpoolRepositoryProviderInterfaceResolver,
    private dateProvider: DateProviderInterfaceResolver,
  ) {
    super();
  }

  // FIXME return type in ResultInterface declaration
  public async handle(params: ParamsInterface, context: ContextType): Promise<any> {
    // // const { identity, start_at, end_at, type } = castParams<ParamsInterface>(params);
    // // TODO find a better way to cast input before calling the action
    // params = castParams<ParamsInterface>(params);
    // const identity = { uuid: 'b409aa51-dee8-4276-9dde-b55d3fd0c7e9' };
    // const operator = { uuid: 'c5b07e35-651e-4688-b0b7-2811073bfcf3', name: 'Mobicoop' };
    // const territory = { uuid: '4b5b1de9-6a06-4ed7-b405-c9141a7437d6', name: 'Paris Ile-de-France' };
    // // fetch the data for this identity, operator and territory and map to template object
    // const rows = (await this.carpoolRepository.find(params)).slice(0, 11);
    // const total_km = Math.round(rows.reduce((sum: number, line): number => line.km + sum, 0));
    // const total_cost = Math.round(rows.reduce((sum: number, line): number => line.eur + sum, 0));
    // const remaining = (total_km * 0.558 - total_cost) | 0;
    // const meta = {
    //   total_km,
    //   total_cost,
    //   remaining,
    //   total_point: 0,
    //   rows: rows.map((line, index) => ({
    //     index,
    //     month: upperFirst(this.dateProvider.format(new Date(`${line.y}-${line.m}-01`), 'MMMM yyyy')),
    //     distance: line.km | 0,
    //   })),
    // };
    // // store the certificate
    // const certificate = await this.certRepository.create({
    //   meta,
    //   identity_id: identity.uuid,
    //   operator_id: identity.uuid,
    //   territory_id: identity.uuid,
    //   start_at: params.start_at,
    //   end_at: params.end_at,
    // });
    // // return certificate;
    // // switch (type) {
    // //   case 'png':
    // //     return this.printer.png(identity, start_at, end_at);
    // //   case 'json':
    // //     return this.kernel.call('certificate:render', params, context);
    // //   default:
    // //     return this.printer.pdf(identity, start_at, end_at);
    // // }
  }
}

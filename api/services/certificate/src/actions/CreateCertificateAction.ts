import { upperFirst } from 'lodash';
import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { DateProviderInterfaceResolver } from '@pdc/provider-date';

import { handlerConfig, ParamsInterface } from '../shared/certificate/create.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { alias } from '../shared/certificate/create.schema';
import { CertificateRepositoryProviderInterfaceResolver } from '../interfaces/CertificateRepositoryProviderInterface';
import { CarpoolRepositoryProviderInterfaceResolver } from '../interfaces/CarpoolRepositoryProviderInterface';

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
  public async handle(params: ParamsInterface): Promise<any> {
    const { identity, start_at, end_at } = this.castParams(params);

    // TODO get the Identity object
    const person = { uuid: 'b409aa51-dee8-4276-9dde-b55d3fd0c7e9' };
    // const person = await this.identityRepository.find({ phone: identity });

    // TODO get this from the connected operator
    const operator = { uuid: 'c5b07e35-651e-4688-b0b7-2811073bfcf3', name: 'Mobicoop' };

    // TODO pass this to the query as a parameter
    const territory = { uuid: '4b5b1de9-6a06-4ed7-b405-c9141a7437d6', name: 'Paris Ile-de-France' };

    // fetch the data for this identity, operator and territory and map to template object
    // TODO agg the last line
    const rows = (await this.carpoolRepository.find({ identity, start_at, end_at })).slice(0, 11);
    const total_km = Math.round(rows.reduce((sum: number, line): number => line.km + sum, 0));
    const total_cost = Math.round(rows.reduce((sum: number, line): number => line.eur + sum, 0));
    const remaining = (total_km * 0.558 - total_cost) | 0;
    const meta = {
      total_km,
      total_cost,
      remaining,
      total_point: 0,
      rows: rows.map((line, index) => ({
        index,
        month: upperFirst(this.dateProvider.format(new Date(`${line.y}-${line.m}-01`), 'MMMM yyyy')),
        distance: line.km | 0,
      })),
    };

    // store the certificate
    const certificate = await this.certRepository.create({
      meta,
      end_at,
      start_at,
      identity_id: person.uuid,
      operator_id: operator.uuid,
      territory_id: territory.uuid,
    });

    return certificate;
  }

  /**
   * Make sure the start and end dates are coherent with one another.
   * Fill in with sensible defaults when not provided.
   *
   * Cast the identity as a phone number for now.
   * Will be refactored when the ID engine is up and running
   */
  private castParams(params: ParamsInterface): Required<ParamsInterface> {
    const origin = new Date('2018-01-01T00:00:00+0100'); // Europe/Paris
    let { identity, start_at, end_at } = params;

    start_at = 'start_at' in params ? new Date(start_at) : origin;
    end_at = 'end_at' in params ? new Date(end_at) : new Date();

    // normalize dates
    if (end_at.getTime() > new Date().getTime()) {
      end_at = new Date();
    }

    if (start_at.getTime() >= end_at.getTime()) {
      start_at = origin;
    }

    // normalize identity (phone number for now)
    identity = identity
      .replace(/^\s([1-9]{2,3})/, '+$1')
      .replace(/[^+0-9]/g, '')
      .replace(/^0/, '+33');

    return { identity, start_at, end_at };
  }
}

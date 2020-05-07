import { upperFirst } from 'lodash';
import { handler, KernelInterfaceResolver } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { DateProviderInterfaceResolver } from '@pdc/provider-date';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/certificate/create.contract';
import { alias } from '../shared/certificate/create.schema';
import { CertificateRepositoryProviderInterfaceResolver } from '../interfaces/CertificateRepositoryProviderInterface';
import { CarpoolRepositoryProviderInterfaceResolver } from '../interfaces/CarpoolRepositoryProviderInterface';
import { IdentityRepositoryProviderInterfaceResolver } from '../interfaces/IdentityRepositoryProviderInterface';

@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    ['can', ['certificate.create']],
  ],
})
export class CreateCertificateAction extends AbstractAction {
  constructor(
    private kernel: KernelInterfaceResolver,
    private identityRepository: IdentityRepositoryProviderInterfaceResolver,
    private certRepository: CertificateRepositoryProviderInterfaceResolver,
    private carpoolRepository: CarpoolRepositoryProviderInterfaceResolver,
    private dateProvider: DateProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(
    params: ParamsInterface,
  ): Promise<{
    meta: {
      httpStatus: number;
    };
    data: ResultInterface;
  }> {
    const { identity, tz, operator_id, start_at, end_at, start_pos, end_pos } = this.castParams(params);

    // fetch the data for this identity, operator and territory and map to template object
    const person = await this.identityRepository.find(identity);
    const operator = await this.kernel.call(
      'operator:quickfind',
      { _id: operator_id },
      {
        channel: { service: 'certificate' },
        call: { user: { permissions: ['operator.read'] } },
      },
    );

    // fetch the data for this identity, operator and territory and map to template object
    const certs = await this.carpoolRepository.find({ identity: person._id, start_at, end_at, start_pos, end_pos });
    const rows = certs.slice(0, 11); // TODO agg the last line
    const total_km = Math.round(rows.reduce((sum: number, line): number => line.km + sum, 0)) || 0;
    const total_cost = Math.round(rows.reduce((sum: number, line): number => line.eur + sum, 0)) || 0;
    const remaining = (total_km * 0.558 - total_cost) | 0;
    const meta = {
      tz,
      identity: { uuid: person.uuid },
      operator: { uuid: operator.uuid, name: operator.name },
      total_km,
      total_cost,
      remaining,
      total_point: 0,
      rows: rows.map((line, index) => ({
        index,
        month: upperFirst(this.dateProvider.format(new Date(`${line.y}-${line.m}-01`), 'MMMM yyyy')),
        trips: line.trips == 1 ? '1 trajet' : `${line.trips} trajets`,
        distance: line.km | 0,
        cost: line.eur || 0,
      })),
    };

    // store the certificate
    const certificate = await this.certRepository.create({
      meta,
      end_at,
      start_at,
      operator_id,
      identity_id: person._id,
    });

    return {
      meta: { httpStatus: 201 },
      data: {
        _id: certificate._id,
        uuid: certificate.uuid,
        created_at: certificate.created_at,
      },
    };
  }

  /**
   * Make sure the start and end dates are coherent with one another.
   * Fill in with sensible defaults when not provided.
   *
   * Cast the identity as a phone number for now.
   * Will be refactored when the ID engine is up and running
   */
  private castParams(params: ParamsInterface): ParamsInterface & { start_at: Date; end_at: Date } {
    const origin = new Date('2020-01-01T00:00:00+0100'); // Europe/Paris
    let { start_at, end_at } = params;

    start_at = 'start_at' in params ? new Date(start_at) : origin;
    end_at = 'end_at' in params ? new Date(end_at) : new Date();

    // normalize dates
    if (end_at.getTime() > new Date().getTime()) {
      end_at = new Date();
    }

    if (start_at.getTime() >= end_at.getTime()) {
      start_at = origin;
    }

    return { ...params, start_at, end_at };
  }
}

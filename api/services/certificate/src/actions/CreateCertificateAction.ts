import { ConfigInterfaceResolver, ContextType, handler, KernelInterfaceResolver, NotFoundException } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { DateProviderInterfaceResolver } from '@pdc/provider-date';
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from '@pdc/provider-middleware';
import { omit, upperFirst } from 'lodash';
import {
  CarpoolInterface,
  CarpoolRepositoryProviderInterfaceResolver,
  FindParamsInterface
} from '../interfaces/CarpoolRepositoryProviderInterface';
import { CertificateRepositoryProviderInterfaceResolver } from '../interfaces/CertificateRepositoryProviderInterface';
import { MetaRowInterface } from '../shared/certificate/common/interfaces/CertificateMetaInterface';
import { IdentityIdentifiersInterface } from '../shared/certificate/common/interfaces/IdentityIdentifiersInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/certificate/create.contract';
import { alias } from '../shared/certificate/create.schema';
import { WithHttpStatus } from '../shared/common/handler/WithHttpStatus';
import { CertificateInterface } from './../../../../../dashboard/src/app/core/entities/api/shared/certificate/common/interfaces/CertificateInterface';


@handler({
  ...handlerConfig,
  middlewares: [
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      operator: 'operator.certificate.create',
      registry: 'registry.certificate.create',
    }),
    ['validate', alias],
  ],
})
export class CreateCertificateAction extends AbstractAction {
  constructor(
    private kernel: KernelInterfaceResolver,
    private certRepository: CertificateRepositoryProviderInterfaceResolver,
    private carpoolRepository: CarpoolRepositoryProviderInterfaceResolver,
    private dateProvider: DateProviderInterfaceResolver,
    private config: ConfigInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<WithHttpStatus<ResultInterface>> {
    const { identity, tz, operator_id, start_at, end_at, positions } = this.castParams(params);

    // fetch the data for this identity and operator and map to template object
    // get the last available UUID for the person. They can have many
    const b1 = new Date();
    const personUUID: string = await this.findPerson(identity, operator_id);
    console.debug(`[cert:create] findPerson: ${(new Date().getTime() - b1.getTime()) / 1000}s`);

    const b2 = new Date();
    const operator = await this.findOperator(operator_id, context);
    console.debug(`[cert:create] findOperator: ${(new Date().getTime() - b2.getTime()) / 1000}s`);

    // fetch the data for this identity and operator and map to template object
    const b3 = new Date();
    let carpools:CarpoolInterface[] = await this.findTrips({ personUUID, operator_id, tz, start_at, end_at, positions });
    console.debug(`[cert:create] findTrips: ${(new Date().getTime() - b3.getTime()) / 1000}s`);

    this.throwNotFoundIfEmpty(carpools);
    carpools = this.removeDuplicateTripId(carpools);

    // get totals
    const total_tr = new Set(carpools.map(c => c.trip_id)).size;
    const total_km = Math.round(carpools.reduce((sum: number, line): number => line.km + sum, 0));
    const total_rm = carpools.reduce((sum: number, line): number => line.rac + sum, 0);
    const metaRows: MetaRowInterface[] = this.aggregateTripByYearMonth(carpools);

    const certificate = await this.storeCertificate(
      tz,
      personUUID, 
      operator,
      total_tr,
      total_km, 
      total_rm,
      metaRows, 
      end_at,
      start_at,
      operator_id)

    return {
      meta: { httpStatus: 201 },
      data: {
        uuid: certificate.uuid,
        created_at: certificate.created_at,
        meta: omit(certificate.meta, ['identity', 'operator']),
      },
    };
  }

  private async storeCertificate(
        tz: string, 
        personUUID: string, 
        operator: any, 
        total_tr: number,
        total_km: number,
        total_rm: number,
        results: MetaRowInterface[],
        end_at: Date,
        start_at: Date,
        operator_id: number,
    ): Promise<CertificateInterface> {
    return this.certRepository.create({
      meta: {
        tz,
        identity: { uuid: personUUID },
        operator: { uuid: operator.uuid, name: operator.name },
        total_tr,
        total_km,
        total_rm,
        total_point: 0,
        rows: results.slice(0, 11),  // TODO agg the last line
      },
      end_at,
      start_at,
      operator_id,
      identity_uuid: personUUID,
    });
  }

  private aggregateTripByYearMonth(carpools: CarpoolInterface[]): MetaRowInterface[] {
    let index: number = 0;
    let metaRows: MetaRowInterface[] = [];

    // aggregate and sum by year month
    carpools
      .map((c:CarpoolInterface) => {
        c.month = upperFirst(this.dateProvider.format(new Date(`${c.year}-${c.month}-01`), 'MMMM yyyy'));
        return c;
      })
      .reduce((acc, val)=> {
        if(!acc[val.month]){
          acc[val.month] = {
            month: val.month,
            index:index++,
            distance: 0,
            remaining: 0,
            trips : 0,
          };
          metaRows.push(acc[val.month]);
        }
        let operator_incentives = JSON.parse(val.payments).filter(p => p.type === 'incentive').reduce((incentive_sum, p) => incentive_sum + p.amount/100, 0);
        acc[val.month].distance = acc[val.month].distance + val.km;
        acc[val.month].remaining = acc[val.month].remaining + val.rac - operator_incentives;
        acc[val.month].trips = acc[val.month].trips + 1;
        return acc;
      }, {});

    // truncate totals
    return metaRows.map(r => {
      return {
        ...r,
        remaining: Math.floor(r.remaining*100)/100,
        distance: parseInt(r.distance.toString())
      }
    })
  }

  private removeDuplicateTripId(carpools: CarpoolInterface[]): CarpoolInterface[] {
    return carpools.filter((item, index, array) => array.findIndex(t => (t.trip_id === item.trip_id)) === index);
  }

  private throwNotFoundIfEmpty(carpools: CarpoolInterface[]) {
    if (carpools.length === 0) {
      throw new NotFoundException('No trips found for provided identity');
    }
  }

  private async findPerson(identity: IdentityIdentifiersInterface, operator_id: number): Promise<string> {
    return this.kernel.call(
      'carpool:finduuid',
      { identity, operator_id },
      {
        channel: { service: 'certificate' },
        call: { user: {} },
      },
    );
  }

  private async findOperator(operator_id: number, context: ContextType): Promise<any> {
    return this.kernel.call(
      'operator:quickfind',
      { _id: operator_id, thumbnail: false },
      {
        ...context,
        channel: { service: 'certificate' },
      },
    );
  }

  private async findTrips(options: FindParamsInterface): Promise<CarpoolInterface[]> {
    return this.carpoolRepository.find(options);
  }

  /**
   * Make sure the start and end dates are coherent with one another.
   * Fill in with sensible defaults when not provided.
   *
   * Cast the identity as a phone number for now.
   * Will be refactored when the ID engine is up and running
   */
  private castParams(params: ParamsInterface): ParamsInterface & { start_at: Date; end_at: Date } {
    const origin = new Date('2019-01-01T00:00:00+0100'); // Europe/Paris
    const end_at_max = new Date().getTime() - this.config.get('delays.create.end_at_buffer', 6) * 86400000;

    let { start_at, end_at } = params;

    start_at = 'start_at' in params ? new Date(start_at) : origin;
    end_at = 'end_at' in params ? new Date(end_at) : new Date(end_at_max);

    // start_at must be older than n days + 1
    if (start_at.getTime() > end_at_max) {
      start_at = new Date(end_at_max - 86400000);
    }

    // end_at must be older than n days
    if (end_at.getTime() > end_at_max) {
      end_at = new Date(end_at_max);
    }

    // start_at must be older than end_at, otherwise we
    // set a 24 hours slot
    if (start_at.getTime() >= end_at.getTime()) {
      start_at = new Date(end_at.getTime() - 86400000);
    }

    return { ...params, start_at, end_at };
  }
}

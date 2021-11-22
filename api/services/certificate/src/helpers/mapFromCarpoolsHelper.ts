/* eslint-disable max-len,prettier/prettier */
import { CertificateRepositoryProviderInterfaceResolver as Store } from '../interfaces/CertificateRepositoryProviderInterface';
import { CarpoolInterface, CarpoolTypeEnum } from '../shared/certificate/common/interfaces/CarpoolInterface';
import { CertificateInterface } from '../shared/certificate/common/interfaces/CertificateInterface';
import { CertificateMetaInterface, MetaPersonInterface } from '../shared/certificate/common/interfaces/CertificateMetaInterface';
import { PointInterface } from '../shared/common/interfaces/PointInterface';
/* eslint-enable */

export interface ParamsInterface {
  person: { uuid: string };
  operator: { _id: number; uuid: string; name: string };
  carpools: CarpoolInterface[];
  params: Partial<{
    tz: string;
    start_at: Date;
    end_at: Date;
    start_pos: PointInterface;
    end_pos: PointInterface;
  }>;
}

export type ResultInterface = CertificateInterface;

export interface MapFromCarpoolInterface {
  (params: ParamsInterface): Promise<ResultInterface>;
}

export const mapFromCarpoolsHelper = (store: Store): MapFromCarpoolInterface => async (
  params: ParamsInterface,
): Promise<ResultInterface> => {
  const {
    person,
    operator,
    carpools,
    params: { tz, end_at, start_at, start_pos, end_pos },
  } = params;

  const meta: CertificateMetaInterface = {
    tz,
    identity: { uuid: person.uuid },
    operator: { uuid: operator.uuid, name: operator.name },
    driver: map(CarpoolTypeEnum.DRIVER, carpools),
    passenger: map(CarpoolTypeEnum.PASSENGER, carpools),
  };

  if (start_pos) meta.start_pos = start_pos;
  if (end_pos) meta.end_pos = end_pos;

  return store.create({ meta, end_at, start_at, operator_id: operator._id, identity_uuid: person.uuid });
};

type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];

export const map = (type: CarpoolTypeEnum, carpools: CarpoolInterface[]): MetaPersonInterface => {
  const subset = carpools.filter((c) => c.type === type);

  const total = subset.reduce<PropType<MetaPersonInterface, 'total'>>(
    (p, c) => {
      const isWeek = [0, 6].indexOf(c.datetime.getDay()) === -1;
      return {
        trips: p.trips + c.trips,
        week_trips: p.week_trips + (isWeek ? c.trips : 0),
        weekend_trips: p.weekend_trips + (isWeek ? 0 : c.trips),
        km: p.km + c.km,
        euros: p.euros + c.euros,
      };
    },
    {
      trips: 0,
      week_trips: 0,
      weekend_trips: 0,
      km: 0,
      euros: 0,
    },
  );

  return {
    total: {
      ...total,
      km: round(total.km, 3),
      euros: round(total.euros, 2),
    },
    trips: subset,
  };
};

function round(n: number, p = 3): number {
  return Math.round(n * Math.pow(10, p)) / Math.pow(10, p);
}

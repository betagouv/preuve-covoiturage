/* eslint-disable max-len,prettier/prettier */
import { CertificateBaseInterface } from '~/shared/certificate/common/interfaces/CertificateBaseInterface';
import { CarpoolInterface, CarpoolTypeEnum } from '../shared/certificate/common/interfaces/CarpoolInterface';
import { CertificateMetaInterface, MetaPersonInterface } from '../shared/certificate/common/interfaces/CertificateMetaInterface';
import { PointInterface } from '../shared/common/interfaces/PointInterface';
/* eslint-enable */

export interface ParamsInterface {
  person: { uuid: string };
  operator: { _id: number; uuid: string; name: string; support: string };
  carpools: CarpoolInterface[];
  params: Partial<{
    tz: string;
    positions: PointInterface[];
    start_at: Date;
    end_at: Date;
  }>;
}

export const mapFromCarpools = (params: ParamsInterface): CertificateBaseInterface => {
  const {
    person,
    operator,
    carpools,
    params: { tz, end_at, start_at, positions },
  } = params;

  const meta: CertificateMetaInterface = {
    tz,
    positions,
    identity: { uuid: person.uuid },
    operator: { uuid: operator.uuid, name: operator.name, support: operator.support },
    driver: agg(CarpoolTypeEnum.DRIVER, carpools),
    passenger: agg(CarpoolTypeEnum.PASSENGER, carpools),
  };

  return { meta, end_at, start_at, operator_id: operator._id, identity_uuid: person.uuid };
};

type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];

export const agg = (type: CarpoolTypeEnum, carpools: CarpoolInterface[]): MetaPersonInterface => {
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
      km: round(total.km, 1),
      euros: round(total.euros, 2),
    },
    trips: subset.map((trip) => ({
      ...trip,
      km: round(trip.km, 1),
      euros: round(trip.euros, 2),
    })),
  };
};

function round(n: number, p = 3): number {
  return Math.round(n * Math.pow(10, p)) / Math.pow(10, p);
}

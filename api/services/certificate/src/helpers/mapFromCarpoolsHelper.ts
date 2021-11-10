/* eslint-disable max-len,prettier/prettier */
import { omit } from 'lodash';
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

  const weeks: PropType<MetaPersonInterface, 'weeks'> = subset
    .filter((c) => c.week !== null)
    .map((i) => omit(i, ['month']));

  const months: PropType<MetaPersonInterface, 'months'> = subset
    .filter((c) => c.month !== null)
    .map((i) => omit(i, ['week']));

  const totals = subset.filter((c) => c.week === null && c.month === null);
  const total = totals.length ? omit(totals[0], ['week', 'month']) : null;

  return { weeks, months, total };
};

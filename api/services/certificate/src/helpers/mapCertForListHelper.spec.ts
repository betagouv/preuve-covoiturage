/* eslint-disable max-len */
import test from 'ava';
import { mapCertForListHelper } from './mapCertForListHelper';
import { RowType, ResultRowInterface } from '../shared/certificate/common/interfaces/ResultRowInterface';
import { CertificateInterface } from '../shared/certificate/common/interfaces/CertificateInterface';
import { CarpoolTypeEnum } from '../shared/certificate/common/interfaces/CarpoolInterface';

const oldFormat: any = {
  _id: 1,
  uuid: 'eb2c49c3-2080-4575-88ca-1786614606e6',
  identity_uuid: 'bbe1fb74-ef00-4009-aba2-22163874991e',
  operator_id: 1,
  start_at: new Date('2020-01-01T00:00:00Z'),
  end_at: new Date('2021-01-01T00:00:00Z'),
  created_at: new Date('2021-02-01T00:00:00Z'),
  updated_at: new Date('2021-02-01T00:00:00Z'),
  meta: {
    tz: 'Europe/Paris',
    rows: [{ cost: 1.5, index: 0, month: 'Mai 2019', trips: '1 trajet', distance: 29 }],
    identity: { uuid: 'bbe1fb74-ef00-4009-aba2-22163874991e' },
    operator: { name: 'MaxiCovoit', uuid: '5c211eea-27e2-4bd4-b854-9009ca1f18d8' },
    total_km: 29,
    remaining: 14,
    total_cost: 2,
    total_point: 0,
  },
};

const newEmptyFormat: CertificateInterface = {
  _id: 2,
  uuid: '72d5d1c2-69b0-474a-b724-bada4a2377b1',
  identity_uuid: '75853df1-5d8e-406d-9fe1-7d976f4ffca1',
  operator_id: 2,
  start_at: new Date('2020-01-01T00:00:00Z'),
  end_at: new Date('2021-01-01T00:00:00Z'),
  created_at: new Date('2021-02-01T00:00:00Z'),
  updated_at: new Date('2021-02-01T00:00:00Z'),
  meta: {
    tz: 'Europe/Paris',
    identity: { uuid: '75853df1-5d8e-406d-9fe1-7d976f4ffca1' },
    operator: { name: 'UltraCovoit', uuid: '58592037-1e25-47b7-a518-7699a4dce8d9' },
    driver: { total: { trips: 0, week_trips: 0, weekend_trips: 0, km: 0, euros: 0 }, trips: [] },
    passenger: { total: { trips: 0, week_trips: 0, weekend_trips: 0, km: 0, euros: 0 }, trips: [] },
  },
};

/* eslint-disable prettier/prettier */
const newFormat: CertificateInterface = {
  _id: 3,
  uuid: 'd8d7801f-19c4-456d-83bc-177ee30293d4',
  identity_uuid: '75853df1-5d8e-406d-9fe1-7d976f4ffca1',
  operator_id: 2,
  start_at: new Date('2020-01-01T00:00:00Z'),
  end_at: new Date('2021-01-01T00:00:00Z'),
  created_at: new Date('2021-11-11T09:57:01.905Z'),
  updated_at: new Date('2021-02-01T00:00:00Z'),
  meta: {
    tz: 'Europe/Paris',
    identity: { uuid: '75853df1-5d8e-406d-9fe1-7d976f4ffca1' },
    operator: { name: 'UltraCovoit', uuid: '58592037-1e25-47b7-a518-7699a4dce8d9' },
    driver: { total: { trips: 37, week_trips: 27, weekend_trips: 10, km: 310, euros: 31 }, trips: [
      { type: CarpoolTypeEnum.DRIVER, datetime: new Date('2021-01-04'), trips: 15, km: 100, euros: 10 },
      { type: CarpoolTypeEnum.DRIVER, datetime: new Date('2021-01-05'), trips: 10, km: 100, euros: 10 },
      { type: CarpoolTypeEnum.DRIVER, datetime: new Date('2021-01-09'), trips: 10, km: 100, euros: 10 },
      { type: CarpoolTypeEnum.DRIVER, datetime: new Date('2021-02-01'), trips: 2, km: 10, euros: 1 },
    ] },
    passenger: { total: { trips: 37, week_trips: 27, weekend_trips: 10, km: 310, euros: 31 }, trips: [
      { type: CarpoolTypeEnum.PASSENGER, datetime: new Date('2021-01-04'), trips: 15, km: 100, euros: 10 },
      { type: CarpoolTypeEnum.PASSENGER, datetime: new Date('2021-01-05'), trips: 10, km: 100, euros: 10 },
      { type: CarpoolTypeEnum.PASSENGER, datetime: new Date('2021-01-09'), trips: 10, km: 100, euros: 10 },
      { type: CarpoolTypeEnum.PASSENGER, datetime: new Date('2021-02-01'), trips: 2, km: 10, euros: 1 },
    ] },
  },
};
/* eslint-enable prettier/prettier */

test('old format returns empty values with expired status', (t) => {
  const res: ResultRowInterface = mapCertForListHelper(oldFormat);
  const exp: ResultRowInterface = {
    type: RowType.EXPIRED,
    uuid: oldFormat.uuid,
    tz: oldFormat.meta.tz,
    operator: oldFormat.meta.operator,
    driver: { total: { trips: 0, week_trips: 0, weekend_trips: 0, km: 0, euros: 0 }, trips: [] },
    passenger: { total: { trips: 0, week_trips: 0, weekend_trips: 0, km: 0, euros: 0 }, trips: [] },
  };

  t.is(res.type, RowType.EXPIRED);
  t.deepEqual(exp, res);
});

test('new empty format returns empty values with OK status', (t) => {
  const res: ResultRowInterface = mapCertForListHelper(newEmptyFormat);
  const exp: ResultRowInterface = {
    type: RowType.OK,
    uuid: newEmptyFormat.uuid,
    tz: newEmptyFormat.meta.tz,
    operator: newEmptyFormat.meta.operator,
    driver: { total: { trips: 0, week_trips: 0, weekend_trips: 0, km: 0, euros: 0 }, trips: [] },
    passenger: { total: { trips: 0, week_trips: 0, weekend_trips: 0, km: 0, euros: 0 }, trips: [] },
  };

  t.is(res.type, RowType.OK);
  t.deepEqual(exp, res);
});

test('new format returns mapped values and OK status', (t) => {
  const res: ResultRowInterface = mapCertForListHelper(newFormat);
  const exp: ResultRowInterface = {
    type: RowType.OK,
    uuid: newFormat.uuid,
    tz: newFormat.meta.tz,
    operator: newFormat.meta.operator,
    driver: {
      total: { trips: 37, week_trips: 27, weekend_trips: 10, km: 310, euros: 31 },
      trips: [
        { type: CarpoolTypeEnum.DRIVER, datetime: new Date('2021-01-04'), trips: 15, km: 100, euros: 10 },
        { type: CarpoolTypeEnum.DRIVER, datetime: new Date('2021-01-05'), trips: 10, km: 100, euros: 10 },
        { type: CarpoolTypeEnum.DRIVER, datetime: new Date('2021-01-09'), trips: 10, km: 100, euros: 10 },
        { type: CarpoolTypeEnum.DRIVER, datetime: new Date('2021-02-01'), trips: 2, km: 10, euros: 1 },
      ],
    },
    passenger: {
      total: { trips: 37, week_trips: 27, weekend_trips: 10, km: 310, euros: 31 },
      trips: [
        { type: CarpoolTypeEnum.PASSENGER, datetime: new Date('2021-01-04'), trips: 15, km: 100, euros: 10 },
        { type: CarpoolTypeEnum.PASSENGER, datetime: new Date('2021-01-05'), trips: 10, km: 100, euros: 10 },
        { type: CarpoolTypeEnum.PASSENGER, datetime: new Date('2021-01-09'), trips: 10, km: 100, euros: 10 },
        { type: CarpoolTypeEnum.PASSENGER, datetime: new Date('2021-02-01'), trips: 2, km: 10, euros: 1 },
      ],
    },
  };

  t.is(res.type, RowType.OK);
  t.deepEqual(exp, res);
});

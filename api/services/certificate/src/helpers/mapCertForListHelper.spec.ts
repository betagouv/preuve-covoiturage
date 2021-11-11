/* eslint-disable max-len */
import test from 'ava';
import { mapCertForListHelper } from './mapCertForListHelper';
import { RowType, ResultRowInterface } from '../shared/certificate/list.contract';
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
    driver: { total: null, weeks: [], months: [] },
    identity: { uuid: '75853df1-5d8e-406d-9fe1-7d976f4ffca1' },
    operator: { name: 'UltraCovoit', uuid: '58592037-1e25-47b7-a518-7699a4dce8d9' },
    passenger: { total: null, weeks: [], months: [] },
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
    driver: {
      total: { km: 11063.9, dim: false, jeu: true, lun: true, mar: true, mer: true, sam: false, ven: true, type: CarpoolTypeEnum.DRIVER, euros: 1364.0, trips: 310, datetime: new Date('2021-01-04T00:00:00Z'), uniq_days: 31 },
      weeks: [
        { km: 356.9, dim: false, jeu: true, lun: true, mar: true, mer: true, sam: false, ven: true, type: CarpoolTypeEnum.DRIVER, week: 1, euros: 44.0, trips: 10, datetime: new Date('2021-01-04T00:00:00Z'), uniq_days: 5 },
        { km: 321.21, dim: false, jeu: true, lun: true, mar: true, mer: true, sam: false, ven: true, type: CarpoolTypeEnum.DRIVER, week: 2, euros: 39.6, trips: 9, datetime: new Date('2021-01-11T00:00:00Z'), uniq_days: 5 },
        { km: 356.9, dim: false, jeu: true, lun: true, mar: true, mer: true, sam: false, ven: true, type: CarpoolTypeEnum.DRIVER, week: 3, euros: 44.0, trips: 10, datetime: new Date('2021-01-18T00:00:00Z'), uniq_days: 5 },
      ],
      months: [
        { km: 1391.91, dim: false, jeu: true, lun: true, mar: true, mer: true, sam: false, ven: true, type: CarpoolTypeEnum.DRIVER, euros: 171.6, month: 1, trips: 39, datetime: new Date('2021-01-04T00:00:00Z'), uniq_days: 20 },
        { km: 678.11, dim: false, jeu: true, lun: true, mar: true, mer: true, sam: false, ven: true, type: CarpoolTypeEnum.DRIVER, euros: 83.6, month: 2, trips: 19, datetime: new Date('2021-02-01T00:00:00Z'), uniq_days: 19 },
        { km: 1463.29, dim: false, jeu: true, lun: true, mar: true, mer: true, sam: false, ven: true, type: CarpoolTypeEnum.DRIVER, euros: 180.4, month: 3, trips: 41, datetime: new Date('2021-03-01T00:00:00Z'), uniq_days: 23 },
      ],
    },
    passenger: { total: null, weeks: [], months: [] },
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
    driver: { uniq_days: null, trips: null, km: null, euros: null },
    passenger: { uniq_days: null, trips: null, km: null, euros: null },
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
    driver: { uniq_days: null, trips: null, km: null, euros: null },
    passenger: { uniq_days: null, trips: null, km: null, euros: null },
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
    driver: { uniq_days: 31, trips: 310, km: 11063.9, euros: 1364 },
    passenger: { uniq_days: null, trips: null, km: null, euros: null },
  };

  t.is(res.type, RowType.OK);
  t.deepEqual(exp, res);
});

/* eslint-disable max-len */
import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';
import { mapCertForListHelper } from './mapCertForListHelper.ts';
import { RowType, ResultRowInterface } from '@/shared/certificate/common/interfaces/ResultRowInterface.ts';
import { CertificateInterface } from '@/shared/certificate/common/interfaces/CertificateInterface.ts';
import { CarpoolTypeEnum } from '@/shared/certificate/common/interfaces/CarpoolInterface.ts';

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
    driver: { total: { trips: 0, week_trips: 0, weekend_trips: 0, distance: 0, amount: 0 }, trips: [] },
    passenger: { total: { trips: 0, week_trips: 0, weekend_trips: 0, distance: 0, amount: 0 }, trips: [] },
    positions: [],
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
    driver: { total: { trips: 37, week_trips: 27, weekend_trips: 10, distance: 310, amount: 31 }, trips: [
      { type: CarpoolTypeEnum.DRIVER, datetime: new Date('2021-01-04'), trips: 15, distance: 100, amount: 10 },
      { type: CarpoolTypeEnum.DRIVER, datetime: new Date('2021-01-05'), trips: 10, distance: 100, amount: 10 },
      { type: CarpoolTypeEnum.DRIVER, datetime: new Date('2021-01-09'), trips: 10, distance: 100, amount: 10 },
      { type: CarpoolTypeEnum.DRIVER, datetime: new Date('2021-02-01'), trips: 2, distance: 10, amount: 1 },
    ] },
    passenger: { total: { trips: 37, week_trips: 27, weekend_trips: 10, distance: 310, amount: 31 }, trips: [
      { type: CarpoolTypeEnum.PASSENGER, datetime: new Date('2021-01-04'), trips: 15, distance: 100, amount: 10 },
      { type: CarpoolTypeEnum.PASSENGER, datetime: new Date('2021-01-05'), trips: 10, distance: 100, amount: 10 },
      { type: CarpoolTypeEnum.PASSENGER, datetime: new Date('2021-01-09'), trips: 10, distance: 100, amount: 10 },
      { type: CarpoolTypeEnum.PASSENGER, datetime: new Date('2021-02-01'), trips: 2, distance: 10, amount: 1 },
    ] },
    positions: [],
  },
};
/* eslint-enable prettier/prettier */

it('new empty format returns empty values with OK status', (t) => {
  const res: ResultRowInterface = mapCertForListHelper(newEmptyFormat);
  const exp: ResultRowInterface = {
    type: RowType.OK,
    uuid: newEmptyFormat.uuid,
    tz: newEmptyFormat.meta.tz,
    start_at: newEmptyFormat.start_at,
    end_at: newEmptyFormat.end_at,
    created_at: newEmptyFormat.created_at,
    identity: { uuid: newEmptyFormat.identity_uuid },
    operator: { _id: newEmptyFormat.operator_id, ...newEmptyFormat.meta.operator },
    driver: { total: { trips: 0, week_trips: 0, weekend_trips: 0, distance: 0, amount: 0 }, trips: [] },
    passenger: { total: { trips: 0, week_trips: 0, weekend_trips: 0, distance: 0, amount: 0 }, trips: [] },
    positions: [],
  };

  assertEquals(res.type, RowType.OK);
  assertObjectMatch(exp, res);
});

it('new format returns mapped values and OK status', (t) => {
  const res: ResultRowInterface = mapCertForListHelper(newFormat);
  const exp: ResultRowInterface = {
    type: RowType.OK,
    uuid: newFormat.uuid,
    tz: newFormat.meta.tz,
    start_at: newFormat.start_at,
    end_at: newFormat.end_at,
    created_at: newFormat.created_at,
    identity: { uuid: newFormat.identity_uuid },
    operator: { _id: newFormat.operator_id, ...newFormat.meta.operator },
    driver: {
      total: { trips: 37, week_trips: 27, weekend_trips: 10, distance: 310, amount: 31 },
      trips: [
        { type: CarpoolTypeEnum.DRIVER, datetime: new Date('2021-01-04'), trips: 15, distance: 100, amount: 10 },
        { type: CarpoolTypeEnum.DRIVER, datetime: new Date('2021-01-05'), trips: 10, distance: 100, amount: 10 },
        { type: CarpoolTypeEnum.DRIVER, datetime: new Date('2021-01-09'), trips: 10, distance: 100, amount: 10 },
        { type: CarpoolTypeEnum.DRIVER, datetime: new Date('2021-02-01'), trips: 2, distance: 10, amount: 1 },
      ],
    },
    passenger: {
      total: { trips: 37, week_trips: 27, weekend_trips: 10, distance: 310, amount: 31 },
      trips: [
        { type: CarpoolTypeEnum.PASSENGER, datetime: new Date('2021-01-04'), trips: 15, distance: 100, amount: 10 },
        { type: CarpoolTypeEnum.PASSENGER, datetime: new Date('2021-01-05'), trips: 10, distance: 100, amount: 10 },
        { type: CarpoolTypeEnum.PASSENGER, datetime: new Date('2021-01-09'), trips: 10, distance: 100, amount: 10 },
        { type: CarpoolTypeEnum.PASSENGER, datetime: new Date('2021-02-01'), trips: 2, distance: 10, amount: 1 },
      ],
    },
    positions: [],
  };

  assertEquals(res.type, RowType.OK);
  assertObjectMatch(exp, res);
});

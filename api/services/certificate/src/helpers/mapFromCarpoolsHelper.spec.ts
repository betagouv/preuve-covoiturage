/* eslint-disable max-len */
import anyTest, { TestInterface } from 'ava';
import { CarpoolInterface, CarpoolTypeEnum } from '../shared/certificate/common/interfaces/CarpoolInterface';
import { MetaPersonInterface } from '../shared/certificate/common/interfaces/CertificateMetaInterface';
import { map } from './mapFromCarpoolsHelper';

interface Context {
  carpools: CarpoolInterface[];
}

const test = anyTest as TestInterface<Partial<Context>>;

test.beforeEach((t) => {
  t.context = {
    carpools: [
      /* eslint-disable prettier/prettier */
      { type: CarpoolTypeEnum.DRIVER, week: 1, month: null, datetime: new Date('2021-01-01'), uniq_days: 7, trips: 15, lun: true, mar: true, mer: true, jeu: true, ven: true, sam: true, dim: true, km: 100, euros: 10 },
      { type: CarpoolTypeEnum.DRIVER, week: 2, month: null, datetime: new Date('2021-01-08'), uniq_days: 5, trips: 10, lun: true, mar: true, mer: true, jeu: true, ven: true, sam: false, dim: false, km: 100, euros: 10 },
      { type: CarpoolTypeEnum.DRIVER, week: 3, month: null, datetime: new Date('2021-01-15'), uniq_days: 5, trips: 10, lun: true, mar: true, mer: true, jeu: true, ven: true, sam: false, dim: false, km: 100, euros: 10 },
      { type: CarpoolTypeEnum.DRIVER, week: 5, month: null, datetime: new Date('2021-02-01'), uniq_days: 1, trips: 2, lun: true, mar: false, mer: false, jeu: false, ven: false, sam: false, dim: false, km: 10, euros: 1 },
      { type: CarpoolTypeEnum.DRIVER, week: null, month: null, datetime: new Date('2021-01-01'), uniq_days: 18, trips: 37, lun: true, mar: true, mer: true, jeu: true, ven: true, sam: true, dim: true, km: 310, euros: 31 },
      { type: CarpoolTypeEnum.PASSENGER, week: 1, month: null, datetime: new Date('2021-01-01'), uniq_days: 7, trips: 15, lun: true, mar: true, mer: true, jeu: true, ven: true, sam: true, dim: true, km: 100, euros: 10 },
      { type: CarpoolTypeEnum.PASSENGER, week: 2, month: null, datetime: new Date('2021-01-08'), uniq_days: 5, trips: 10, lun: true, mar: true, mer: true, jeu: true, ven: true, sam: false, dim: false, km: 100, euros: 10 },
      { type: CarpoolTypeEnum.PASSENGER, week: 3, month: null, datetime: new Date('2021-01-15'), uniq_days: 5, trips: 10, lun: true, mar: true, mer: true, jeu: true, ven: true, sam: false, dim: false, km: 100, euros: 10 },
      { type: CarpoolTypeEnum.PASSENGER, week: 5, month: null, datetime: new Date('2021-02-01'), uniq_days: 1, trips: 2, lun: true, mar: false, mer: false, jeu: false, ven: false, sam: false, dim: false, km: 10, euros: 1 },
      { type: CarpoolTypeEnum.PASSENGER, week: null, month: null, datetime: new Date('2021-01-01'), uniq_days: 18, trips: 37, lun: true, mar: true, mer: true, jeu: true, ven: true, sam: true, dim: true, km: 310, euros: 31 },
      { type: CarpoolTypeEnum.DRIVER, week: null, month: 1, datetime: new Date('2021-01-01'), uniq_days: 17, trips: 35, lun: true, mar: true, mer: true, jeu: true, ven: true, sam: true, dim: true, km: 300, euros: 30 },
      { type: CarpoolTypeEnum.DRIVER, week: null, month: 2, datetime: new Date('2021-02-01'), uniq_days: 1, trips: 2, lun: true, mar: false, mer: false, jeu: false, ven: false, sam: false, dim: false, km: 10, euros: 1 },
      { type: CarpoolTypeEnum.PASSENGER, week: null, month: 1, datetime: new Date('2021-01-01'), uniq_days: 17, trips: 35, lun: true, mar: true, mer: true, jeu: true, ven: true, sam: true, dim: true, km: 300, euros: 30 },
      { type: CarpoolTypeEnum.PASSENGER, week: null, month: 2, datetime: new Date('2021-02-01'), uniq_days: 1, trips: 2, lun: true, mar: false, mer: false, jeu: false, ven: false, sam: false, dim: false, km: 10, euros: 1 },
      /* eslint-enable prettier/prettier */
    ],
  };
});

test('convert carpools to driver summary', (t) => {
  const driver = map(CarpoolTypeEnum.DRIVER, t.context.carpools);
  const expected: MetaPersonInterface = {
    /* eslint-disable prettier/prettier */
    weeks: [
      { type: CarpoolTypeEnum.DRIVER, week: 1, datetime: new Date('2021-01-01'), uniq_days: 7, trips: 15, lun: true, mar: true, mer: true, jeu: true, ven: true, sam: true, dim: true, km: 100, euros: 10 },
      { type: CarpoolTypeEnum.DRIVER, week: 2, datetime: new Date('2021-01-08'), uniq_days: 5, trips: 10, lun: true, mar: true, mer: true, jeu: true, ven: true, sam: false, dim: false, km: 100, euros: 10 },
      { type: CarpoolTypeEnum.DRIVER, week: 3, datetime: new Date('2021-01-15'), uniq_days: 5, trips: 10, lun: true, mar: true, mer: true, jeu: true, ven: true, sam: false, dim: false, km: 100, euros: 10 },
      { type: CarpoolTypeEnum.DRIVER, week: 5, datetime: new Date('2021-02-01'), uniq_days: 1, trips: 2, lun: true, mar: false, mer: false, jeu: false, ven: false, sam: false, dim: false, km: 10, euros: 1 },
    ],
    months: [
      { type: CarpoolTypeEnum.DRIVER, month: 1, datetime: new Date('2021-01-01'), uniq_days: 17, trips: 35, lun: true, mar: true, mer: true, jeu: true, ven: true, sam: true, dim: true, km: 300, euros: 30 },
      { type: CarpoolTypeEnum.DRIVER, month: 2, datetime: new Date('2021-02-01'), uniq_days: 1, trips: 2, lun: true, mar: false, mer: false, jeu: false, ven: false, sam: false, dim: false, km: 10, euros: 1 },      
    ],
    total: { type: CarpoolTypeEnum.DRIVER, datetime: new Date('2021-01-01'), uniq_days: 18, trips: 37, lun: true, mar: true, mer: true, jeu: true, ven: true, sam: true, dim: true, km: 310, euros: 31 },
    /* eslint-enable prettier/prettier */
  };

  t.deepEqual(driver, expected);
});

test('convert carpools to passenger summary', (t) => {
  const passenger = map(CarpoolTypeEnum.PASSENGER, t.context.carpools);
  const expected: MetaPersonInterface = {
    /* eslint-disable prettier/prettier */
    weeks: [
      { type: CarpoolTypeEnum.PASSENGER, week: 1, datetime: new Date('2021-01-01'), uniq_days: 7, trips: 15, lun: true, mar: true, mer: true, jeu: true, ven: true, sam: true, dim: true, km: 100, euros: 10 },
      { type: CarpoolTypeEnum.PASSENGER, week: 2, datetime: new Date('2021-01-08'), uniq_days: 5, trips: 10, lun: true, mar: true, mer: true, jeu: true, ven: true, sam: false, dim: false, km: 100, euros: 10 },
      { type: CarpoolTypeEnum.PASSENGER, week: 3, datetime: new Date('2021-01-15'), uniq_days: 5, trips: 10, lun: true, mar: true, mer: true, jeu: true, ven: true, sam: false, dim: false, km: 100, euros: 10 },
      { type: CarpoolTypeEnum.PASSENGER, week: 5, datetime: new Date('2021-02-01'), uniq_days: 1, trips: 2, lun: true, mar: false, mer: false, jeu: false, ven: false, sam: false, dim: false, km: 10, euros: 1 },
    ],
    months: [
      { type: CarpoolTypeEnum.PASSENGER, month: 1, datetime: new Date('2021-01-01'), uniq_days: 17, trips: 35, lun: true, mar: true, mer: true, jeu: true, ven: true, sam: true, dim: true, km: 300, euros: 30 },
      { type: CarpoolTypeEnum.PASSENGER, month: 2, datetime: new Date('2021-02-01'), uniq_days: 1, trips: 2, lun: true, mar: false, mer: false, jeu: false, ven: false, sam: false, dim: false, km: 10, euros: 1 },      
    ],
    total: { type: CarpoolTypeEnum.PASSENGER, datetime: new Date('2021-01-01'), uniq_days: 18, trips: 37, lun: true, mar: true, mer: true, jeu: true, ven: true, sam: true, dim: true, km: 310, euros: 31 },
    /* eslint-enable prettier/prettier */
  };

  t.deepEqual(passenger, expected);
});

test('convert carpools to empty set', (t) => {
  const passenger = map(CarpoolTypeEnum.PASSENGER, []);
  const expected: MetaPersonInterface = {
    weeks: [],
    months: [],
    total: null,
  };

  t.deepEqual(passenger, expected);
});

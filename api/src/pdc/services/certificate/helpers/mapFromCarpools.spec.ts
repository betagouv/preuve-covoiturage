/* eslint-disable max-len */
import anyTest, { TestFn } from 'ava';
import { CarpoolInterface, CarpoolTypeEnum } from '@/shared/certificate/common/interfaces/CarpoolInterface.ts';
import { MetaPersonInterface } from '@/shared/certificate/common/interfaces/CertificateMetaInterface.ts';
import { agg } from './mapFromCarpools.ts';

interface Context {
  carpools: CarpoolInterface[];
}

const test = anyTest as TestFn<Partial<Context>>;

test.beforeEach((t) => {
  t.context = {
    carpools: [
      /* eslint-disable prettier/prettier */
      { type: CarpoolTypeEnum.DRIVER, datetime: new Date('2021-01-04'), trips: 15, distance: 100, amount: 10 },
      { type: CarpoolTypeEnum.DRIVER, datetime: new Date('2021-01-05'), trips: 10, distance: 100, amount: 10 },
      { type: CarpoolTypeEnum.DRIVER, datetime: new Date('2021-01-09'), trips: 10, distance: 100, amount: 10 },
      { type: CarpoolTypeEnum.DRIVER, datetime: new Date('2021-02-01'), trips: 2, distance: 10, amount: 1 },
      { type: CarpoolTypeEnum.PASSENGER, datetime: new Date('2021-01-04'), trips: 15, distance: 100, amount: 10 },
      { type: CarpoolTypeEnum.PASSENGER, datetime: new Date('2021-01-05'), trips: 10, distance: 100, amount: 10 },
      { type: CarpoolTypeEnum.PASSENGER, datetime: new Date('2021-01-09'), trips: 10, distance: 100, amount: 10 },
      { type: CarpoolTypeEnum.PASSENGER, datetime: new Date('2021-02-01'), trips: 2, distance: 10, amount: 1 },
      /* eslint-enable prettier/prettier */
    ],
  };
});

test('convert carpools to driver summary', (t) => {
  const driver = agg(CarpoolTypeEnum.DRIVER, t.context.carpools);
  const expected: MetaPersonInterface = {
    total: { trips: 37, week_trips: 27, weekend_trips: 10, distance: 310, amount: 31 },
    trips: t.context.carpools.filter((i) => i.type === CarpoolTypeEnum.DRIVER),
  };

  t.deepEqual(driver, expected);
});

test('convert carpools to passenger summary', (t) => {
  const passenger = agg(CarpoolTypeEnum.PASSENGER, t.context.carpools);
  const expected: MetaPersonInterface = {
    total: { trips: 37, week_trips: 27, weekend_trips: 10, distance: 310, amount: 31 },
    trips: t.context.carpools.filter((i) => i.type === CarpoolTypeEnum.PASSENGER),
  };

  t.deepEqual(passenger, expected);
});

test('convert carpools to empty set', (t) => {
  const passenger = agg(CarpoolTypeEnum.PASSENGER, []);
  const expected: MetaPersonInterface = {
    total: { trips: 0, week_trips: 0, weekend_trips: 0, distance: 0, amount: 0 },
    trips: [],
  };

  t.deepEqual(passenger, expected);
});

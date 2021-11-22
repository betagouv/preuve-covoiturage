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
      { type: CarpoolTypeEnum.DRIVER, datetime: new Date('2021-01-04'), trips: 15, km: 100, euros: 10 },
      { type: CarpoolTypeEnum.DRIVER, datetime: new Date('2021-01-05'), trips: 10, km: 100, euros: 10 },
      { type: CarpoolTypeEnum.DRIVER, datetime: new Date('2021-01-09'), trips: 10, km: 100, euros: 10 },
      { type: CarpoolTypeEnum.DRIVER, datetime: new Date('2021-02-01'), trips: 2, km: 10, euros: 1 },
      { type: CarpoolTypeEnum.PASSENGER, datetime: new Date('2021-01-04'), trips: 15, km: 100, euros: 10 },
      { type: CarpoolTypeEnum.PASSENGER, datetime: new Date('2021-01-05'), trips: 10, km: 100, euros: 10 },
      { type: CarpoolTypeEnum.PASSENGER, datetime: new Date('2021-01-09'), trips: 10, km: 100, euros: 10 },
      { type: CarpoolTypeEnum.PASSENGER, datetime: new Date('2021-02-01'), trips: 2, km: 10, euros: 1 },
      /* eslint-enable prettier/prettier */
    ],
  };
});

test('convert carpools to driver summary', (t) => {
  const driver = map(CarpoolTypeEnum.DRIVER, t.context.carpools);
  const expected: MetaPersonInterface = {
    total: { trips: 37, week_trips: 27, weekend_trips: 10, km: 310, euros: 31 },
    trips: t.context.carpools.filter((i) => i.type === CarpoolTypeEnum.DRIVER),
  };

  t.deepEqual(driver, expected);
});

test('convert carpools to passenger summary', (t) => {
  const passenger = map(CarpoolTypeEnum.PASSENGER, t.context.carpools);
  const expected: MetaPersonInterface = {
    total: { trips: 37, week_trips: 27, weekend_trips: 10, km: 310, euros: 31 },
    trips: t.context.carpools.filter((i) => i.type === CarpoolTypeEnum.PASSENGER),
  };

  t.deepEqual(passenger, expected);
});

test('convert carpools to empty set', (t) => {
  const passenger = map(CarpoolTypeEnum.PASSENGER, []);
  const expected: MetaPersonInterface = {
    total: { trips: 0, week_trips: 0, weekend_trips: 0, km: 0, euros: 0 },
    trips: [],
  };

  t.deepEqual(passenger, expected);
});

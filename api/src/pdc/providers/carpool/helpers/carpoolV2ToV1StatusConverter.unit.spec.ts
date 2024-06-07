import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';
import { CarpoolAcquisitionStatusEnum, CarpoolFraudStatusEnum, CarpoolV1StatusEnum } from '../interfaces/index.ts';
import { carpoolV2ToV1StatusConverter } from './carpoolV2ToV1StatusConverter.ts';

type Config = Array<{
  title: string;
  args: [CarpoolAcquisitionStatusEnum, CarpoolFraudStatusEnum];
  expected: CarpoolV1StatusEnum;
}>;

const pendingFraud: Config = [
  {
    title: 'Pending fraud status + received -> ok',
    args: [CarpoolAcquisitionStatusEnum.Received, CarpoolFraudStatusEnum.Pending],
    expected: CarpoolV1StatusEnum.Ok,
  },
  {
    title: 'Pending fraud status + updated -> ok',
    args: [CarpoolAcquisitionStatusEnum.Updated, CarpoolFraudStatusEnum.Pending],
    expected: CarpoolV1StatusEnum.Ok,
  },
  {
    title: 'Pending fraud status + processed -> ok',
    args: [CarpoolAcquisitionStatusEnum.Processed, CarpoolFraudStatusEnum.Pending],
    expected: CarpoolV1StatusEnum.Ok,
  },
  {
    title: 'Pending fraud status + failed -> anomaly_error',
    args: [CarpoolAcquisitionStatusEnum.Failed, CarpoolFraudStatusEnum.Pending],
    expected: CarpoolV1StatusEnum.AnomalyError,
  },
  {
    title: 'Pending fraud status + canceled -> canceled',
    args: [CarpoolAcquisitionStatusEnum.Canceled, CarpoolFraudStatusEnum.Pending],
    expected: CarpoolV1StatusEnum.Canceled,
  },
  {
    title: 'Pending fraud status + expired -> expired',
    args: [CarpoolAcquisitionStatusEnum.Expired, CarpoolFraudStatusEnum.Pending],
    expected: CarpoolV1StatusEnum.Expired,
  },
];

const passedFraud: Config = [
  {
    title: 'Passed fraud status + received -> ok',
    args: [CarpoolAcquisitionStatusEnum.Received, CarpoolFraudStatusEnum.Passed],
    expected: CarpoolV1StatusEnum.Ok,
  },
  {
    title: 'Passed fraud status + updated -> ok',
    args: [CarpoolAcquisitionStatusEnum.Updated, CarpoolFraudStatusEnum.Passed],
    expected: CarpoolV1StatusEnum.Ok,
  },
  {
    title: 'Passed fraud status + processed -> ok',
    args: [CarpoolAcquisitionStatusEnum.Processed, CarpoolFraudStatusEnum.Passed],
    expected: CarpoolV1StatusEnum.Ok,
  },
  {
    title: 'Passed fraud status + failed -> anomaly_error',
    args: [CarpoolAcquisitionStatusEnum.Failed, CarpoolFraudStatusEnum.Passed],
    expected: CarpoolV1StatusEnum.AnomalyError,
  },
  {
    title: 'Passed fraud status + canceled -> canceled',
    args: [CarpoolAcquisitionStatusEnum.Canceled, CarpoolFraudStatusEnum.Passed],
    expected: CarpoolV1StatusEnum.Canceled,
  },
  {
    title: 'Passed fraud status + expired -> expired',
    args: [CarpoolAcquisitionStatusEnum.Expired, CarpoolFraudStatusEnum.Passed],
    expected: CarpoolV1StatusEnum.Expired,
  },
];

const failedFraud: Config = [
  {
    title: 'Failed fraud status + received -> fraudcheck_error',
    args: [CarpoolAcquisitionStatusEnum.Received, CarpoolFraudStatusEnum.Failed],
    expected: CarpoolV1StatusEnum.FraudcheckError,
  },
  {
    title: 'Failed fraud status + updated -> fraudcheck_error',
    args: [CarpoolAcquisitionStatusEnum.Updated, CarpoolFraudStatusEnum.Failed],
    expected: CarpoolV1StatusEnum.FraudcheckError,
  },
  {
    title: 'Failed fraud status + processed -> fraudcheck_error',
    args: [CarpoolAcquisitionStatusEnum.Processed, CarpoolFraudStatusEnum.Failed],
    expected: CarpoolV1StatusEnum.FraudcheckError,
  },
  {
    title: 'Failed fraud status + failed -> fraudcheck_error',
    args: [CarpoolAcquisitionStatusEnum.Failed, CarpoolFraudStatusEnum.Failed],
    expected: CarpoolV1StatusEnum.FraudcheckError,
  },
  {
    title: 'Failed fraud status + canceled -> fraudcheck_error',
    args: [CarpoolAcquisitionStatusEnum.Canceled, CarpoolFraudStatusEnum.Failed],
    expected: CarpoolV1StatusEnum.FraudcheckError,
  },
  {
    title: 'Failed fraud status + expired -> fraudcheck_error',
    args: [CarpoolAcquisitionStatusEnum.Expired, CarpoolFraudStatusEnum.Failed],
    expected: CarpoolV1StatusEnum.FraudcheckError,
  },
];

for (const { title, args, expected } of [...pendingFraud, ...passedFraud, ...failedFraud]) {
  it(title, (t) => {
    assertEquals(carpoolV2ToV1StatusConverter(args[0], args[1]), expected);
  });
}

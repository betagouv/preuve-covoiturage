import { assertEquals, it } from "@/dev_deps.ts";
import { CarpoolAnomalyStatusEnum } from "@/pdc/providers/carpool/interfaces/common.ts";
import { CarpoolStatus } from "../interfaces/database/label.ts";
import {
  CarpoolAcquisitionStatusEnum,
  CarpoolFraudStatusEnum,
  CarpoolStatusEnum,
} from "../interfaces/index.ts";
import { castToStatusEnum } from "./castStatus.ts";

type Config = Array<{
  title: string;
  args: Partial<CarpoolStatus>;
  expected: CarpoolStatusEnum;
}>;

const pendingFraud: Config = [
  {
    title: "Pending fraud status + received -> pending",
    args: {
      acquisition_status: CarpoolAcquisitionStatusEnum.Received,
      fraud_status: CarpoolFraudStatusEnum.Pending,
    },
    expected: CarpoolStatusEnum.Pending,
  },
  {
    title: "Pending fraud status + updated -> pending",
    args: {
      acquisition_status: CarpoolAcquisitionStatusEnum.Updated,
      fraud_status: CarpoolFraudStatusEnum.Pending,
    },
    expected: CarpoolStatusEnum.Pending,
  },
  {
    title: "Pending fraud status + processed -> ok",
    args: {
      acquisition_status: CarpoolAcquisitionStatusEnum.Processed,
      fraud_status: CarpoolFraudStatusEnum.Pending,
    },
    expected: CarpoolStatusEnum.Ok,
  },
  {
    title: "Pending fraud status + failed -> acquisition_error",
    args: {
      acquisition_status: CarpoolAcquisitionStatusEnum.Failed,
    },
    expected: CarpoolStatusEnum.AcquisitionError,
  },
  {
    title: "Pending fraud status + canceled -> canceled",
    args: {
      acquisition_status: CarpoolAcquisitionStatusEnum.Canceled,
      fraud_status: CarpoolFraudStatusEnum.Pending,
    },
    expected: CarpoolStatusEnum.Canceled,
  },
  {
    title: "Pending fraud status + expired -> expired",
    args: {
      acquisition_status: CarpoolAcquisitionStatusEnum.Expired,
      fraud_status: CarpoolFraudStatusEnum.Pending,
    },
    expected: CarpoolStatusEnum.Expired,
  },
];

const passedFraud: Config = [
  {
    title: "Passed fraud status + received -> ok",
    args: {
      acquisition_status: CarpoolAcquisitionStatusEnum.Processed,
      fraud_status: CarpoolFraudStatusEnum.Passed,
    },
    expected: CarpoolStatusEnum.Ok,
  },
  {
    title: "Passed fraud status + updated -> ok",
    args: {
      acquisition_status: CarpoolAcquisitionStatusEnum.Updated,
      fraud_status: CarpoolFraudStatusEnum.Passed,
    },
    expected: CarpoolStatusEnum.Ok,
  },
  {
    title: "Passed fraud status + processed -> ok",
    args: {
      acquisition_status: CarpoolAcquisitionStatusEnum.Processed,
      fraud_status: CarpoolFraudStatusEnum.Passed,
    },
    expected: CarpoolStatusEnum.Ok,
  },
  {
    title: "Passed fraud status + failed -> anomaly_error",
    args: {
      acquisition_status: CarpoolAcquisitionStatusEnum.Failed,
      fraud_status: CarpoolFraudStatusEnum.Passed,
    },
    expected: CarpoolStatusEnum.AnomalyError,
  },
  {
    title: "Passed fraud status + canceled -> canceled",
    args: {
      acquisition_status: CarpoolAcquisitionStatusEnum.Canceled,
      fraud_status: CarpoolFraudStatusEnum.Passed,
    },
    expected: CarpoolStatusEnum.Canceled,
  },
  {
    title: "Passed fraud status + expired -> expired",
    args: {
      acquisition_status: CarpoolAcquisitionStatusEnum.Expired,
      fraud_status: CarpoolFraudStatusEnum.Passed,
    },
    expected: CarpoolStatusEnum.Expired,
  },
];

const failedFraud: Config = [
  {
    title: "Failed fraud status + processed -> fraudcheck_error",
    args: {
      acquisition_status: CarpoolAcquisitionStatusEnum.Processed,
      fraud_status: CarpoolFraudStatusEnum.Failed,
    },
    expected: CarpoolStatusEnum.FraudError,
  },
  {
    title: "Failed anomaly status + processed -> anomaly_error",
    args: {
      acquisition_status: CarpoolAcquisitionStatusEnum.Expired,
      anomaly_status: CarpoolAnomalyStatusEnum.Failed,
    },
    expected: CarpoolStatusEnum.AnomalyError,
  },
];

for (
  const { title, args, expected } of [
    ...pendingFraud,
    ...passedFraud,
    ...failedFraud,
  ]
) {
  it(title, () => {
    assertEquals(castToStatusEnum(args), expected);
  });
}

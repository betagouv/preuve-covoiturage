/* eslint-disable max-len */
import { assertEquals, beforeEach, describe, it } from "@/dev_deps.ts";
import {
  CarpoolInterface,
  CarpoolTypeEnum,
} from "@/shared/certificate/common/interfaces/CarpoolInterface.ts";
import { MetaPersonInterface } from "@/shared/certificate/common/interfaces/CertificateMetaInterface.ts";
import { agg } from "./mapFromCarpools.ts";

describe("map from carpool", () => {
  let carpools: CarpoolInterface[];

  beforeEach(() => {
    carpools = [
      {
        type: CarpoolTypeEnum.DRIVER,
        datetime: new Date("2021-01-04"),
        trips: 15,
        distance: 100,
        amount: 10,
      },
      {
        type: CarpoolTypeEnum.DRIVER,
        datetime: new Date("2021-01-05"),
        trips: 10,
        distance: 100,
        amount: 10,
      },
      {
        type: CarpoolTypeEnum.DRIVER,
        datetime: new Date("2021-01-09"),
        trips: 10,
        distance: 100,
        amount: 10,
      },
      {
        type: CarpoolTypeEnum.DRIVER,
        datetime: new Date("2021-02-01"),
        trips: 2,
        distance: 10,
        amount: 1,
      },
      {
        type: CarpoolTypeEnum.PASSENGER,
        datetime: new Date("2021-01-04"),
        trips: 15,
        distance: 100,
        amount: 10,
      },
      {
        type: CarpoolTypeEnum.PASSENGER,
        datetime: new Date("2021-01-05"),
        trips: 10,
        distance: 100,
        amount: 10,
      },
      {
        type: CarpoolTypeEnum.PASSENGER,
        datetime: new Date("2021-01-09"),
        trips: 10,
        distance: 100,
        amount: 10,
      },
      {
        type: CarpoolTypeEnum.PASSENGER,
        datetime: new Date("2021-02-01"),
        trips: 2,
        distance: 10,
        amount: 1,
      },
    ];
  });

  it("convert carpools to driver summary", () => {
    const driver = agg(CarpoolTypeEnum.DRIVER, carpools);
    const expected: MetaPersonInterface = {
      total: {
        trips: 37,
        week_trips: 27,
        weekend_trips: 10,
        distance: 310,
        amount: 31,
      },
      trips: carpools.filter((i) => i.type === CarpoolTypeEnum.DRIVER),
    };

    assertEquals(driver, expected);
  });

  it("convert carpools to passenger summary", () => {
    const passenger = agg(CarpoolTypeEnum.PASSENGER, carpools);
    const expected: MetaPersonInterface = {
      total: {
        trips: 37,
        week_trips: 27,
        weekend_trips: 10,
        distance: 310,
        amount: 31,
      },
      trips: carpools.filter((i) => i.type === CarpoolTypeEnum.PASSENGER),
    };

    assertEquals(passenger, expected);
  });

  it("convert carpools to empty set", () => {
    const passenger = agg(CarpoolTypeEnum.PASSENGER, []);
    const expected: MetaPersonInterface = {
      total: {
        trips: 0,
        week_trips: 0,
        weekend_trips: 0,
        distance: 0,
        amount: 0,
      },
      trips: [],
    };

    assertEquals(passenger, expected);
  });
});

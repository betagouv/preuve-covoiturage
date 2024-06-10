import {
  afterAll,
  afterEach,
  assert,
  assertEquals,
  assertFalse,
  assertObjectMatch,
  assertThrows,
  beforeAll,
  beforeEach,
  describe,
  it,
} from "@/dev_deps.ts";
import { OperatorsEnum } from "../../interfaces/index.ts";
import { getOperatorsAt, TimestampedOperators } from "./getOperatorsAt.ts";

// Unit test the getOperators method based on GrandPoitiers configuration

const list: TimestampedOperators = [
  {
    date: new Date("2023-09-27T00:00:00+0200"),
    operators: [OperatorsEnum.KAROS],
  },
  {
    date: new Date("2023-10-16T00:00:00+0200"),
    operators: [OperatorsEnum.KAROS, OperatorsEnum.MOBICOOP],
  },
  {
    date: new Date("2023-12-22T00:00:00+0100"),
    operators: [
      OperatorsEnum.KAROS,
      OperatorsEnum.MOBICOOP,
      OperatorsEnum.BLABLACAR_DAILY,
      OperatorsEnum.KLAXIT,
    ],
  },
];

it("missing operators returns empty array", (t) => {
  assertObjectMatch(getOperatorsAt(undefined), []);
});

it("missing operators property returns empty array", (t) => {
  // @ts-expect-error
  assertObjectMatch(getOperatorsAt([{ date: new Date() }]), []);
});

it("missing date property returns empty array", (t) => {
  // @ts-expect-error
  assertObjectMatch(getOperatorsAt([{ operators: [] }]), []);
});

it("should return the last operators if no datetime is provided", (t) => {
  assertObjectMatch(getOperatorsAt(list), [
    OperatorsEnum.KAROS,
    OperatorsEnum.MOBICOOP,
    OperatorsEnum.BLABLACAR_DAILY,
    OperatorsEnum.KLAXIT,
  ]);
});

it("should return Karos only if datetime is before 16/10/2023", (t) => {
  assertObjectMatch(getOperatorsAt(list, new Date("2023-10-15")), [
    OperatorsEnum.KAROS,
  ]);
});

it("should return Karos and Mobicoop if datetime is after 16/10/2023", (t) => {
  assertObjectMatch(getOperatorsAt(list, new Date("2023-10-17")), [
    OperatorsEnum.KAROS,
    OperatorsEnum.MOBICOOP,
  ]);
});

it("should return all operators if datetime is after 22/12/2023", (t) => {
  assertObjectMatch(getOperatorsAt(list, new Date("2023-12-23")), [
    OperatorsEnum.KAROS,
    OperatorsEnum.MOBICOOP,
    OperatorsEnum.BLABLACAR_DAILY,
    OperatorsEnum.KLAXIT,
  ]);
});

it("should sort operators in chronological order: sorted", (t) => {
  const list: TimestampedOperators = [
    {
      date: new Date("2023-01-01T00:00:00+0100"),
      operators: [OperatorsEnum.KAROS],
    },
    {
      date: new Date("2023-02-01T00:00:00+0100"),
      operators: [OperatorsEnum.MOBICOOP],
    },
    {
      date: new Date("2023-03-01T00:00:00+0100"),
      operators: [OperatorsEnum.BLABLACAR_DAILY],
    },
  ];

  const sorted = getOperatorsAt(list);
  assertObjectMatch([OperatorsEnum.BLABLACAR_DAILY], sorted);
});

it("should sort operators in chronological order: reverse", (t) => {
  const list: TimestampedOperators = [
    {
      date: new Date("2023-03-01T00:00:00+0100"),
      operators: [OperatorsEnum.BLABLACAR_DAILY],
    },
    {
      date: new Date("2023-02-01T00:00:00+0100"),
      operators: [OperatorsEnum.MOBICOOP],
    },
    {
      date: new Date("2023-01-01T00:00:00+0100"),
      operators: [OperatorsEnum.KAROS],
    },
  ];

  const sorted = getOperatorsAt(list);
  assertObjectMatch([OperatorsEnum.BLABLACAR_DAILY], sorted);
});

it("should sort operators in chronological order: random", (t) => {
  const list: TimestampedOperators = [
    {
      date: new Date("2023-03-01T00:00:00+0100"),
      operators: [OperatorsEnum.KAROS],
    },
    {
      date: new Date("2023-04-01T00:00:00+0100"),
      operators: [OperatorsEnum.BLABLACAR_DAILY],
    },
    {
      date: new Date("2023-02-01T00:00:00+0100"),
      operators: [OperatorsEnum.MOBICOOP],
    },
    {
      date: new Date("2023-01-01T00:00:00+0100"),
      operators: [OperatorsEnum.KLAXIT],
    },
  ];

  const sorted = getOperatorsAt(list);
  assertObjectMatch([OperatorsEnum.BLABLACAR_DAILY], sorted);
});

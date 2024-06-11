import { faker } from "@/deps.ts";
import {
  afterEach,
  assertEquals,
  assertThrows,
  beforeEach,
  describe,
  it,
  sinon,
  SinonStub,
} from "@/dev_deps.ts";
import { ContextType, KernelInterfaceResolver } from "@/ilos/common/index.ts";
import { ResultInterface } from "@/shared/policy/simulateOnPastGeo.contract.ts";
import {
  CarpoolInterface,
  PolicyInterface,
  TripRepositoryProviderInterfaceResolver,
} from "../interfaces/index.ts";
import { SimulateOnPastByGeoAction } from "./SimulateOnPastByGeoAction.ts";

describe(() => {
  let fakeKernelInterfaceResolver: KernelInterfaceResolver;
  let tripRepository: TripRepositoryProviderInterfaceResolver;
  let kernelInterfaceResolverStub: SinonStub<
    [method: string, params: any, context: ContextType]
  >;
  let tripRepositoryResolverStub: SinonStub;
  let simulateOnPasGeoAction: SimulateOnPastByGeoAction;
  let todayMinusSizMonthes: Date;

  class FakeTripRepositoryProvider
    extends TripRepositoryProviderInterfaceResolver {
    findTripByPolicy(
      policy: PolicyInterface,
      from: Date,
      to: Date,
      batchSize?: number | undefined,
      override?: boolean | undefined,
    ): AsyncGenerator<CarpoolInterface[], void, void> {
      throw new Error("Method not implemented.");
    }
    findTripByGeo(
      coms: string[],
      from: Date,
      to: Date,
      batchSize?: number | undefined,
      override?: boolean | undefined,
    ): AsyncGenerator<CarpoolInterface[], void, void> {
      throw new Error("Method not implemented.");
    }
  }

  beforeEach(() => {
    fakeKernelInterfaceResolver =
      new (class extends KernelInterfaceResolver {})();
    tripRepository = new FakeTripRepositoryProvider();
    simulateOnPasGeoAction = new SimulateOnPastByGeoAction(
      fakeKernelInterfaceResolver,
      tripRepository,
    );

    kernelInterfaceResolverStub = sinon.stub(
      fakeKernelInterfaceResolver,
      "call",
    ) as any;
    tripRepositoryResolverStub = sinon.stub(
      tripRepository,
      "findTripByGeo",
    );

    todayMinusSizMonthes = new Date();
    todayMinusSizMonthes.setMonth(
      todayMinusSizMonthes.getMonth() - 6,
    );
  });

  afterEach(() => {
    kernelInterfaceResolverStub!.restore();
  });

  it("SimulateOnPastByGeoAction: should fails if geo not found", async () => {
    // Arrange
    kernelInterfaceResolverStub!.resolves({ coms: [] });

    // Act
    await assertThrows(
      async () =>
        await simulateOnPasGeoAction!.handle({
          territory_insee: "45612333333",
          policy_template_id: "1",
        }),
    );

    // Assert
    // assertEquals(
    //   err?.message,
    //   "Could not find any coms for territory_insee 45612333333",
    // );
    sinon.assert.notCalled(tripRepositoryResolverStub!);
  });

  it("SimulateOnPastByGeoAction: should process trip with default time frame", async () => {
    // Arrange
    kernelInterfaceResolverStub!.resolves({
      aom_siren: "200041630",
      epci_siren: "200041630",
      coms: ["08199", "08137", "08179", "08199"],
    });
    tripRepositoryResolverStub!.callsFake(function* fake() {
      const carpool: Partial<CarpoolInterface> = {
        operator_trip_id: "",
        operator_class: "C",
        datetime: faker.date.between({
          from: todayMinusSizMonthes,
          to: new Date(),
        }),
        seats: 1,
        distance: 25000,
        start: { com: "08199", aom: "200041630", epci: "200041630", reg: "44" },
        end: { com: "08199", aom: "200041630", epci: "200041630", reg: "44" },
      };
      const carpools: Partial<CarpoolInterface>[] = [
        carpool,
        carpool,
        carpool,
        carpool,
      ];
      yield carpools;
    });

    // Act
    const result: ResultInterface = await simulateOnPasGeoAction!
      .handle({
        territory_insee: "200041630",
        policy_template_id: "1",
      });

    // Assert
    assertEquals(result.amount, 1000);
    assertEquals(result.trip_subsidized, 4);
  });

  it("SimulateOnPastByGeoAction: should exclude trip with start and end not in 200070340 epci perimeter", async () => {
    // Arrange
    kernelInterfaceResolverStub!.resolves({
      aom_siren: "84",
      reg_siren: "84",
      epci_siren: "200070340",
      coms: [
        "73040",
        "73290",
        "73117",
        "73223",
        "73023",
        "73322",
        "73157",
        "73026",
        "73119",
        "73047",
      ],
    });
    tripRepositoryResolverStub!.callsFake(function* fake() {
      const carpool: Partial<CarpoolInterface> = {
        operator_trip_id: "",
        operator_class: "C",
        datetime: faker.date.between({
          from: todayMinusSizMonthes,
          to: new Date(),
        }),
        seats: 1,
        distance: 25000,
        start: { com: "73290", aom: "84", epci: "200070340", reg: "84" },
        end: { com: "73194", aom: "84", epci: "247300452", reg: "84" },
      };
      const carpools: Partial<CarpoolInterface>[] = [
        carpool,
        carpool,
        carpool,
        carpool,
      ];
      yield carpools;
    });

    // Act
    const result: ResultInterface = await simulateOnPasGeoAction!
      .handle({
        territory_insee: "200070340",
        policy_template_id: "2",
      });

    // Assert
    assertEquals(result.amount, 0);
    assertEquals(result.trip_subsidized, 0);
  });
});

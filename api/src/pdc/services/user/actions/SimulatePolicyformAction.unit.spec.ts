import {
  afterEach,
  assert,
  assertRejects,
  beforeEach,
  describe,
  it,
  sinon,
} from "@/dev_deps.ts";
import { KernelInterfaceResolver } from "@/ilos/common/index.ts";
import {
  signature as simulateOnPastGeoSignature,
  SimulateOnPastGeoRequiredParams,
} from "@/shared/policy/simulateOnPastGeo.contract.ts";
import { ParamsInterface } from "@/shared/user/simulatePolicyform.contract.ts";
import { UserNotificationProvider } from "../providers/UserNotificationProvider.ts";
import { SimulatePolicyformAction } from "./SimulatePolicyformAction.ts";

describe("simulate policy form", () => {
  const fakeKernelInterfaceResolver =
    new (class extends KernelInterfaceResolver {})();
  const userNotificationProvider = new UserNotificationProvider(
    null as any,
    null as any,
    null as any,
  );

  const simulatePolicyformAction = new SimulatePolicyformAction(
    fakeKernelInterfaceResolver,
    userNotificationProvider,
  );

  const SIMULATE_ON_PAST_BY_GEO_ACTION_CONTEXT = {
    call: {
      user: {},
    },
    channel: {
      service: "user",
    },
  };
  let kernelInterfaceResolverStub: any;
  let userNotificationProviderStub: any;

  beforeEach(() => {
    kernelInterfaceResolverStub = sinon.stub(
      fakeKernelInterfaceResolver,
      "call",
    );
    userNotificationProviderStub = sinon.stub(
      userNotificationProvider,
      "simulationEmail",
    );
  });

  afterEach(() => {
    kernelInterfaceResolverStub!.restore();
    userNotificationProviderStub.restore();
  });

  it("SimulatePolicyformAction: should fail and return geo error if error in SimulateOnPastByGeoAction", async () => {
    // Arrange
    kernelInterfaceResolverStub!.throws(
      new Error("Could not find any coms for territory_insee 45612333333"),
    );

    // Act
    await assertRejects(
      async () =>
        await simulatePolicyformAction!.handle({
          name: "",
          firstname: "",
          job: "Developpeur",
          email: "territory@gmail.com",
          territory_name: "Un pays",
          simulation: {
            territory_insee: "45612333333",
            policy_template_id: "1",
          },
        }),
      "Could not find any coms for territory_insee 45612333333",
    );

    // Assert
    sinon.assert.calledOnce(kernelInterfaceResolverStub);
  });

  it("SimulatePolicyformAction: should call simulation for 1, 3 and 6 months period", async () => {
    // Arrange
    const simulation: SimulateOnPastGeoRequiredParams = {
      territory_insee: "45612333333",
      policy_template_id: "1",
    };
    const params: ParamsInterface = {
      name: "",
      firstname: "",
      job: "Developpeur",
      territory_name: "Un pays",
      email: "territory@gmail.com",
      simulation,
    };
    kernelInterfaceResolverStub!.resolves({
      amount: 1000,
      trip_subsidized: 5,
    });

    // Act
    await simulatePolicyformAction!.handle(params);

    // Assert
    sinon.assert.calledThrice(kernelInterfaceResolverStub);
    sinon.assert.calledWith(
      kernelInterfaceResolverStub.firstCall,
      simulateOnPastGeoSignature,
      { ...simulation, months: 1 },
      SIMULATE_ON_PAST_BY_GEO_ACTION_CONTEXT,
    );
    sinon.assert.calledWith(
      kernelInterfaceResolverStub.secondCall,
      simulateOnPastGeoSignature,
      { ...simulation, months: 3 },
      SIMULATE_ON_PAST_BY_GEO_ACTION_CONTEXT,
    );
    sinon.assert.calledWith(
      kernelInterfaceResolverStub.thirdCall,
      simulateOnPastGeoSignature,
      { ...simulation, months: 6 },
      SIMULATE_ON_PAST_BY_GEO_ACTION_CONTEXT,
    );
    sinon.assert.calledOnceWithExactly(
      userNotificationProviderStub,
      params,
      {
        1: { amount: 1000, trip_subsidized: 5 },
        3: { amount: 1000, trip_subsidized: 5 },
        6: { amount: 1000, trip_subsidized: 5 },
      },
    );
    assert(true);
  });
});

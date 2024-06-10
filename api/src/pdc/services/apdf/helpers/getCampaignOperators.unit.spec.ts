import {
  KernelInterfaceResolver,
  NotFoundException,
  RPCException,
} from "@/ilos/common/index.ts";
import {
  ParamsInterface as FindByUuidParams,
  ResultInterface as FindByUuidResult,
} from "@/shared/operator/findbyuuid.contract.ts";
import { PolicyStatusEnum } from "@/shared/policy/common/interfaces/PolicyInterface.ts";
import { ResultInterface as PolicyFindResult } from "@/shared/policy/find.contract.ts";
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
import {
  getCampaignOperators,
  getPolicyUuidList,
  uuidToOperatorId,
} from "./getCampaignOperators.helper.ts";

interface Context {
  kernel: KernelInterfaceResolver;
  kernelStub: SinonStub;
}

const test = anyTest as TestFn<Context>;

beforeEach((t) => {
  t.context.kernel = new (class extends KernelInterfaceResolver {})();
  t.context.kernelStub = sinon.stub(t.context.kernel, "call");
});

it("getPolicyUuidList: success", async (t) => {
  const response: PolicyFindResult = fakePolicy(1, [
    "12345678900001",
    "98765432100001",
  ]);
  t.context.kernelStub.resolves(response);
  const result = await getPolicyUuidList(t.context.kernel, "apdf", 1);
  assertObjectMatch(result, ["12345678900001", "98765432100001"]);
});

it("getPolicyUuidList: no policy found", async (t) => {
  const message = "policy:find not found";
  t.context.kernelStub.throws(new NotFoundException(message));
  const error: RPCException = await assertThrows(
    getPolicyUuidList(t.context.kernel, "apdf", 1),
    {
      instanceOf: NotFoundException,
    },
  );
  assertEquals(error.rpcError?.data || "", message);
});

it("getPolicyUuidList: no operators", async (t) => {
  const response: PolicyFindResult = fakePolicy(1, []);
  t.context.kernelStub.resolves(response);
  const error: RPCException = await assertThrows(
    getPolicyUuidList(t.context.kernel, "apdf", 1),
    {
      instanceOf: NotFoundException,
    },
  );
  assertEquals(error.rpcError?.data || "", "No UUID declared in policy 1");
});

it("uuidToOperatorId: success", async (t) => {
  const policy = fakePolicy(1, ["12345678900001", "98765432100001"]);
  const query: FindByUuidParams["uuid"] = policy.params.operators;
  const response: FindByUuidResult = [
    { _id: 1, uuid: "12345678900001" },
    { _id: 2, uuid: "98765432100001" },
  ];
  t.context.kernelStub.resolves(response);
  const result = await uuidToOperatorId(t.context.kernel, "apdf", query);
  assertObjectMatch(result, [1, 2]);
});

it("uuidToOperatorId: empty", async (t) => {
  const policy = fakePolicy(1, []);
  const query: FindByUuidParams["uuid"] = policy.params.operators;
  const response: FindByUuidResult = [];
  t.context.kernelStub.resolves(response);
  const result = await uuidToOperatorId(t.context.kernel, "apdf", query);
  assertObjectMatch(result, []);
});

it("uuidToOperatorId: no matching UUID", async (t) => {
  const policy = fakePolicy(1, ["12345678900001", "98765432100001"]);
  const query: FindByUuidParams["uuid"] = policy.params.operators;
  const response: FindByUuidResult = [];
  t.context.kernelStub.resolves(response);
  const result = await uuidToOperatorId(t.context.kernel, "apdf", query);
  assertObjectMatch(result, []);
});

it("getDeclaredOperators: success", async (t) => {
  const policy = fakePolicy(1, ["12345678900001", "98765432100001"]);
  const operators = [
    { _id: 1, uuid: "12345678900001" },
    { _id: 2, uuid: "98765432100001" },
  ];

  t.context.kernelStub.onFirstCall().resolves(policy);
  t.context.kernelStub.onSecondCall().resolves(operators);

  const result = await getCampaignOperators(
    t.context.kernel,
    "apdf",
    policy._id,
  );
  assertObjectMatch(result, [1, 2]);
});

it("getDeclaredOperators: no matching UUID", async (t) => {
  const policy = fakePolicy(1, ["12345678900001", "98765432100001"]);
  const operators = [];

  t.context.kernelStub.onFirstCall().resolves(policy);
  t.context.kernelStub.onSecondCall().resolves(operators);

  const result = await getCampaignOperators(
    t.context.kernel,
    "apdf",
    policy._id,
  );
  assertObjectMatch(result, []);
});

it("getDeclaredOperators: empty", async (t) => {
  const policy = fakePolicy(1, []);
  const operators = [];

  t.context.kernelStub.onFirstCall().resolves(policy);
  t.context.kernelStub.onSecondCall().resolves(operators);

  const result = await getCampaignOperators(
    t.context.kernel,
    "apdf",
    policy._id,
  );
  assertObjectMatch(result, []);
});

function fakePolicy(id: number, operators: string[]): PolicyFindResult {
  return {
    _id: id,
    territory_id: id,
    name: `Policy ${id}`,
    description: `Description ${id}`,
    start_date: new Date("2020-01-08T00:00:00Z"),
    end_date: new Date("2020-02-08T00:00:00Z"),
    status: PolicyStatusEnum.ACTIVE,
    handler: `handler_${id}`,
    incentive_sum: 100,
    params: {
      operators,
    },
  };
}

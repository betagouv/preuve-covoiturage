import { KernelInterfaceResolver, NotFoundException, RPCException } from '/ilos/common/index.ts';
import {
  ParamsInterface as FindByUuidParams,
  ResultInterface as FindByUuidResult,
} from '/shared/operator/findbyuuid.contract.ts';
import { PolicyStatusEnum } from '/shared/policy/common/interfaces/PolicyInterface.ts';
import { ResultInterface as PolicyFindResult } from '/shared/policy/find.contract.ts';
import anyTest, { TestFn } from 'ava';
import sinon, { SinonStub } from 'sinon';
import { getCampaignOperators, getPolicyUuidList, uuidToOperatorId } from './getCampaignOperators.helper.ts';

interface Context {
  kernel: KernelInterfaceResolver;
  kernelStub: SinonStub;
}

const test = anyTest as TestFn<Context>;

test.beforeEach((t) => {
  t.context.kernel = new (class extends KernelInterfaceResolver {})();
  t.context.kernelStub = sinon.stub(t.context.kernel, 'call');
});

test('getPolicyUuidList: success', async (t) => {
  const response: PolicyFindResult = fakePolicy(1, ['12345678900001', '98765432100001']);
  t.context.kernelStub.resolves(response);
  const result = await getPolicyUuidList(t.context.kernel, 'apdf', 1);
  t.deepEqual(result, ['12345678900001', '98765432100001']);
});

test('getPolicyUuidList: no policy found', async (t) => {
  const message = 'policy:find not found';
  t.context.kernelStub.throws(new NotFoundException(message));
  const error: RPCException = await t.throwsAsync(getPolicyUuidList(t.context.kernel, 'apdf', 1), {
    instanceOf: NotFoundException,
  });
  t.is(error.rpcError?.data || '', message);
});

test('getPolicyUuidList: no operators', async (t) => {
  const response: PolicyFindResult = fakePolicy(1, []);
  t.context.kernelStub.resolves(response);
  const error: RPCException = await t.throwsAsync(getPolicyUuidList(t.context.kernel, 'apdf', 1), {
    instanceOf: NotFoundException,
  });
  t.is(error.rpcError?.data || '', 'No UUID declared in policy 1');
});

test('uuidToOperatorId: success', async (t) => {
  const policy = fakePolicy(1, ['12345678900001', '98765432100001']);
  const query: FindByUuidParams['uuid'] = policy.params.operators;
  const response: FindByUuidResult = [
    { _id: 1, uuid: '12345678900001' },
    { _id: 2, uuid: '98765432100001' },
  ];
  t.context.kernelStub.resolves(response);
  const result = await uuidToOperatorId(t.context.kernel, 'apdf', query);
  t.deepEqual(result, [1, 2]);
});

test('uuidToOperatorId: empty', async (t) => {
  const policy = fakePolicy(1, []);
  const query: FindByUuidParams['uuid'] = policy.params.operators;
  const response: FindByUuidResult = [];
  t.context.kernelStub.resolves(response);
  const result = await uuidToOperatorId(t.context.kernel, 'apdf', query);
  t.deepEqual(result, []);
});

test('uuidToOperatorId: no matching UUID', async (t) => {
  const policy = fakePolicy(1, ['12345678900001', '98765432100001']);
  const query: FindByUuidParams['uuid'] = policy.params.operators;
  const response: FindByUuidResult = [];
  t.context.kernelStub.resolves(response);
  const result = await uuidToOperatorId(t.context.kernel, 'apdf', query);
  t.deepEqual(result, []);
});

test('getDeclaredOperators: success', async (t) => {
  const policy = fakePolicy(1, ['12345678900001', '98765432100001']);
  const operators = [
    { _id: 1, uuid: '12345678900001' },
    { _id: 2, uuid: '98765432100001' },
  ];

  t.context.kernelStub.onFirstCall().resolves(policy);
  t.context.kernelStub.onSecondCall().resolves(operators);

  const result = await getCampaignOperators(t.context.kernel, 'apdf', policy._id);
  t.deepEqual(result, [1, 2]);
});

test('getDeclaredOperators: no matching UUID', async (t) => {
  const policy = fakePolicy(1, ['12345678900001', '98765432100001']);
  const operators = [];

  t.context.kernelStub.onFirstCall().resolves(policy);
  t.context.kernelStub.onSecondCall().resolves(operators);

  const result = await getCampaignOperators(t.context.kernel, 'apdf', policy._id);
  t.deepEqual(result, []);
});

test('getDeclaredOperators: empty', async (t) => {
  const policy = fakePolicy(1, []);
  const operators = [];

  t.context.kernelStub.onFirstCall().resolves(policy);
  t.context.kernelStub.onSecondCall().resolves(operators);

  const result = await getCampaignOperators(t.context.kernel, 'apdf', policy._id);
  t.deepEqual(result, []);
});

function fakePolicy(id: number, operators: string[]): PolicyFindResult {
  return {
    _id: id,
    territory_id: id,
    name: `Policy ${id}`,
    description: `Description ${id}`,
    start_date: new Date('2020-01-08T00:00:00Z'),
    end_date: new Date('2020-02-08T00:00:00Z'),
    status: PolicyStatusEnum.ACTIVE,
    handler: `handler_${id}`,
    incentive_sum: 100,
    params: {
      operators,
    },
  };
}

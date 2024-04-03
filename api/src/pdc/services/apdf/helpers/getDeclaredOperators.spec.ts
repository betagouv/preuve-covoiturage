import { KernelInterfaceResolver, NotFoundException, RPCException } from '@ilos/common';
import {
  ParamsInterface as FindBySiretParams,
  ResultInterface as FindBySiretResult,
} from '@shared/operator/findbysiret.contract';
import { PolicyStatusEnum } from '@shared/policy/common/interfaces/PolicyInterface';
import { ResultInterface as PolicyFindResult } from '@shared/policy/find.contract';
import anyTest, { TestFn } from 'ava';
import sinon, { SinonStub } from 'sinon';
import { getDeclaredOperators, getPolicySiretList, siretToOperatorId } from './getDeclaredOperators.helper';

interface Context {
  kernel: KernelInterfaceResolver;
  kernelStub: SinonStub;
}

const test = anyTest as TestFn<Context>;

test.beforeEach((t) => {
  t.context.kernel = new (class extends KernelInterfaceResolver {})();
  t.context.kernelStub = sinon.stub(t.context.kernel, 'call');
});

test('getPolicySiretList: success', async (t) => {
  const response: PolicyFindResult = fakePolicy(1, ['12345678900001', '98765432100001']);
  t.context.kernelStub.resolves(response);
  const result = await getPolicySiretList(t.context.kernel, 'apdf', 1);
  t.deepEqual(result, ['12345678900001', '98765432100001']);
});

test('getPolicySiretList: no policy found', async (t) => {
  const message = 'policy:find not found';
  t.context.kernelStub.throws(new NotFoundException(message));
  const error: RPCException = await t.throwsAsync(getPolicySiretList(t.context.kernel, 'apdf', 1), {
    instanceOf: NotFoundException,
  });
  t.is(error.rpcError?.data || '', message);
});

test('getPolicySiretList: no operators', async (t) => {
  const response: PolicyFindResult = fakePolicy(1, []);
  t.context.kernelStub.resolves(response);
  const error: RPCException = await t.throwsAsync(getPolicySiretList(t.context.kernel, 'apdf', 1), {
    instanceOf: NotFoundException,
  });
  t.is(error.rpcError?.data || '', 'No SIRET declared in policy 1');
});

test('siretToOperatorId: success', async (t) => {
  const policy = fakePolicy(1, ['12345678900001', '98765432100001']);
  const query: FindBySiretParams['siret'] = policy.params.operators;
  const response: FindBySiretResult = [
    { _id: 1, siret: '12345678900001' },
    { _id: 2, siret: '98765432100001' },
  ];
  t.context.kernelStub.resolves(response);
  const result = await siretToOperatorId(t.context.kernel, 'apdf', query);
  t.deepEqual(result, [1, 2]);
});

test('siretToOperatorId: empty', async (t) => {
  const policy = fakePolicy(1, []);
  const query: FindBySiretParams['siret'] = policy.params.operators;
  const response: FindBySiretResult = [];
  t.context.kernelStub.resolves(response);
  const result = await siretToOperatorId(t.context.kernel, 'apdf', query);
  t.deepEqual(result, []);
});

test('siretToOperatorId: no matching SIRET', async (t) => {
  const policy = fakePolicy(1, ['12345678900001', '98765432100001']);
  const query: FindBySiretParams['siret'] = policy.params.operators;
  const response: FindBySiretResult = [];
  t.context.kernelStub.resolves(response);
  const result = await siretToOperatorId(t.context.kernel, 'apdf', query);
  t.deepEqual(result, []);
});

test('getDeclaredOperators: success', async (t) => {
  const policy = fakePolicy(1, ['12345678900001', '98765432100001']);
  const operators = [
    { _id: 1, siret: '12345678900001' },
    { _id: 2, siret: '98765432100001' },
  ];

  t.context.kernelStub.onFirstCall().resolves(policy);
  t.context.kernelStub.onSecondCall().resolves(operators);

  const result = await getDeclaredOperators(t.context.kernel, 'apdf', policy._id);
  t.deepEqual(result, [1, 2]);
});

test('getDeclaredOperators: no matching SIRET', async (t) => {
  const policy = fakePolicy(1, ['12345678900001', '98765432100001']);
  const operators = [];

  t.context.kernelStub.onFirstCall().resolves(policy);
  t.context.kernelStub.onSecondCall().resolves(operators);

  const result = await getDeclaredOperators(t.context.kernel, 'apdf', policy._id);
  t.deepEqual(result, []);
});

test('getDeclaredOperators: empty', async (t) => {
  const policy = fakePolicy(1, []);
  const operators = [];

  t.context.kernelStub.onFirstCall().resolves(policy);
  t.context.kernelStub.onSecondCall().resolves(operators);

  const result = await getDeclaredOperators(t.context.kernel, 'apdf', policy._id);
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

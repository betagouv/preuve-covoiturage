import anyTest, { TestFn } from 'ava';
import sinon, { SinonStub } from 'sinon';
import { TerritoryCodeEnum } from '../shared/territory/common/interfaces/TerritoryCodeInterface';
import { TerritoryService } from './TerritoryService';
import { KernelInterfaceResolver } from '@ilos/common';

// ----------------------------------------------------------------------------------------
// SETUP
// ----------------------------------------------------------------------------------------

interface Context {
  kernel: KernelInterfaceResolver;
  kernelStub: SinonStub;
  service: TerritoryService;
}

const test = anyTest as TestFn<Context>;

test.beforeEach((t) => {
  t.context.kernel = new (class extends KernelInterfaceResolver {})();
  t.context.kernelStub = sinon.stub(t.context.kernel, 'call');
  t.context.service = new TerritoryService(t.context.kernel);
});

// ----------------------------------------------------------------------------------------
// TESTS
// ----------------------------------------------------------------------------------------

test('resolve should return the correct result when no params are provided', async (t) => {
  const result = await t.context.service.resolve({});
  t.deepEqual(result, { [TerritoryCodeEnum.Country]: ['XXXXX'] });
});

test('resolve should return the correct result when geo param is empty', async (t) => {
  const result = await t.context.service.resolve({ geo: [] });
  t.deepEqual(result, { [TerritoryCodeEnum.Country]: ['XXXXX'] });
});

test('resolve should return the correct result when code is not in the TerritoryCodeEnum list', async (t) => {
  const result = await t.context.service.resolve({ geo: ['invalid_code'] });
  t.deepEqual(result, { [TerritoryCodeEnum.Country]: ['XXXXX'] });
});

test('resolve should return the correct result when geo param is an AOM', async (t) => {
  const result = await t.context.service.resolve({ geo: ['aom:code'] });
  t.deepEqual(result, { [TerritoryCodeEnum.Mobility]: ['code'] });
});

test('resolve should return the correct result when geo param is an AOM and a COM', async (t) => {
  const result = await t.context.service.resolve({ geo: ['aom:code', 'com:code'] });
  t.deepEqual(result, { [TerritoryCodeEnum.Mobility]: ['code'], [TerritoryCodeEnum.City]: ['code'] });
});

import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';
import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';
import { TerritoryCodeEnum } from '@/shared/territory/common/interfaces/TerritoryCodeInterface.ts';
import { TerritoryService } from './TerritoryService.ts';
import { KernelInterfaceResolver } from '@/ilos/common/index.ts';

// ----------------------------------------------------------------------------------------
// SETUP
// ----------------------------------------------------------------------------------------

interface Context {
  kernel: KernelInterfaceResolver;
  kernelStub: SinonStub;
  service: TerritoryService;
}

const test = anyTest as TestFn<Context>;

beforeEach((t) => {
  t.context.kernel = new (class extends KernelInterfaceResolver {})();
  t.context.kernelStub = sinon.stub(t.context.kernel, 'call');
  t.context.service = new TerritoryService(t.context.kernel);
});

// ----------------------------------------------------------------------------------------
// TESTS
// ----------------------------------------------------------------------------------------

it('resolve should return the correct result when no params are provided', async (t) => {
  const result = await t.context.service.resolve({});
  assertObjectMatch(result, { [TerritoryCodeEnum.Country]: ['XXXXX'] });
});

it('resolve should return the correct result when geo param is empty', async (t) => {
  const result = await t.context.service.resolve({ geo: [] });
  assertObjectMatch(result, { [TerritoryCodeEnum.Country]: ['XXXXX'] });
});

it('resolve should return the correct result when code is not in the TerritoryCodeEnum list', async (t) => {
  const result = await t.context.service.resolve({ geo: ['invalid_code'] });
  assertObjectMatch(result, { [TerritoryCodeEnum.Country]: ['XXXXX'] });
});

it('resolve should return the correct result when geo param is an AOM', async (t) => {
  const result = await t.context.service.resolve({ geo: ['aom:code'] });
  assertObjectMatch(result, { [TerritoryCodeEnum.Mobility]: ['code'] });
});

it('resolve should return the correct result when geo param is an AOM and a COM', async (t) => {
  const result = await t.context.service.resolve({ geo: ['aom:code', 'com:code'] });
  assertObjectMatch(result, { [TerritoryCodeEnum.Mobility]: ['code'], [TerritoryCodeEnum.City]: ['code'] });
});

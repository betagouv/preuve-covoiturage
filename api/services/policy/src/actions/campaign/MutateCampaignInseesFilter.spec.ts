import { ContextType, KernelInterfaceResolver } from '@ilos/common';
import anyTest, { TestFn } from 'ava';
import sinon, { SinonStub } from 'sinon';
import { MutateCampaignInseesFilter } from './MutateCampaignInseesFilter';

interface Context {
  // Injected tokens
  fakeKernelInterfaceResolver: KernelInterfaceResolver;

  // Injected tokens method's stubs
  kernelInterfaceResolverStub: SinonStub<[method: string, params: any, context: ContextType]>;

  // Constants

  // Tested token
  mutateCampaignInseeFilter: MutateCampaignInseesFilter;
}

const test = anyTest as TestFn<Partial<Context>>;

test.beforeEach((t) => {
  t.context.mutateCampaignInseeFilter = new MutateCampaignInseesFilter();
});

test.afterEach((t) => {});

test('MutateCampaignInseesFilter: should not mutate if no global_rules', async (t) => {
  // Arrange

  // Act
  await t.context.mutateCampaignInseeFilter.call([]);

  // Assert
});

test('MutateCampaignInseesFilter: should not mutate if no global_rules matches', async (t) => {
  // Arrange

  // Act
  await t.context.mutateCampaignInseeFilter.call([]);

  // Assert
});

test('MutateCampaignInseesFilter: should mutate once and no others if one global_rules matches', async (t) => {
  // Arrange

  // Act
  await t.context.mutateCampaignInseeFilter.call([]);

  // Assert
});

test('MutateCampaignInseesFilter: should mutate twice and no others if one global_rules matches', async (t) => {
  // Arrange

  // Act
  await t.context.mutateCampaignInseeFilter.call([]);

  // Assert
});

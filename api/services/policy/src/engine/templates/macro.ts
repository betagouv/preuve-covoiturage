import anyTest, { ExecutionContext, Macro, TestFn } from 'ava';
import { makeKernelBeforeAfter, KernelTestFn } from '@pdc/helper-test';
import { PostgresConnection } from '@ilos/connection-postgres';

import { TripInterface } from '../../interfaces';
import { CampaignPgRepositoryProvider } from '../../providers/CampaignPgRepositoryProvider';
import { ServiceProvider } from '../../ServiceProvider';
import { CampaignInterface } from '../../interfaces';
import { PolicyEngine } from '../PolicyEngine';
import { MetadataRepositoryProvider } from '../../providers/MetadataRepositoryProvider';
import { trips as defaultTrips } from './trips';
import { TerritorySelectorsInterface } from '../../shared/territory/common/interfaces/TerritoryCodeInterface';

interface TestContext extends KernelTestFn {
  policy: CampaignInterface;
  selectors: TerritorySelectorsInterface;
}

interface MacroInterface {
  before: () => Promise<TestContext>;
  after: (params: TestContext) => Promise<void>;
  test: TestFn<TestContext>;
  results: Macro<
    [{ carpool_id: number; amount: number; meta?: { [k: string]: string } }[], TripInterface[]?],
    TestContext
  >;
}

export function macro(policyDef: CampaignInterface): MacroInterface {
  const { before: beforeKn, after: afterKn } = makeKernelBeforeAfter(ServiceProvider);

  async function before(): Promise<TestContext> {
    const { kernel } = await beforeKn();
    const repository = kernel.get(ServiceProvider).get(CampaignPgRepositoryProvider);
    const policy = await repository.create(policyDef);
    const selectors = {
      aom: ['217500016'],
    };

    return {
      kernel,
      policy,
      selectors,
    };
  }

  async function after(params: TestContext): Promise<void> {
    if (params.policy._id) {
      const connection = params.kernel.get(ServiceProvider).get(PostgresConnection).getClient();
      const campaignRepository = params.kernel.get(ServiceProvider).get(CampaignPgRepositoryProvider);
      const metaRepository = params.kernel.get(ServiceProvider).get(MetadataRepositoryProvider);
      await connection.query({
        text: `DELETE FROM ${campaignRepository.table} WHERE _id = $1::int`,
        values: [params.policy._id],
      });

      await connection.query({
        text: `DELETE FROM ${metaRepository.table} WHERE policy_id = $1::int`,
        values: [params.policy._id],
      });
    }
    await afterKn({ kernel: params.kernel });
  }

  const results: Macro<
    [{ carpool_id: number; amount: number; meta?: { [k: string]: string } }[], TripInterface[]?],
    TestContext
  > = anyTest.macro({
    exec: async (
      t: ExecutionContext<TestContext>,
      expected: { carpool_id: number; amount: number; meta?: { [k: string]: string } }[],
      trips: TripInterface[] = defaultTrips,
    ) => {
      const engine = t.context.kernel.get(ServiceProvider).get(PolicyEngine);
      const incentives = [];
      const campaign = engine.buildCampaign(t.context.policy, t.context.selectors);
      for (const trip of trips) {
        const r = await engine.process(campaign, trip);
        incentives.push(...r);
      }
      t.log(incentives);
      t.is(incentives.length, expected.length, 'every trip should have an incentive');
      for (const { amount, carpool_id, meta } of expected) {
        const incentive = incentives.find((i) => i.carpool_id === carpool_id);
        t.is(incentive.amount, amount);
        if (meta) {
          t.deepEqual(incentive.meta, meta);
        }
      }
    },
    title: (providedTitle = '', input, expected): string => `${providedTitle} ${input} = ${expected}`.trim(),
  });

  const test = anyTest as TestFn<TestContext>;
  test.before(async (t) => {
    const { kernel, policy, selectors } = await before();
    t.context.kernel = kernel;
    t.context.policy = policy;
    t.context.selectors = selectors;
  });
  test.after.always(async (t) => {
    const { kernel, policy, selectors } = t.context;
    await after({ kernel, policy, selectors });
  });

  return {
    results,
    before,
    after,
    test,
  };
}

import anyTest, { ExecutionContext, Macro, TestFn } from 'ava';
import { makeKernelBeforeAfter, KernelTestFn, dbBeforeMacro } from '@pdc/helper-test';
import { PostgresConnection } from '@ilos/connection-postgres';

import { TripInterface } from '../../interfaces';
import { CampaignPgRepositoryProvider } from '../../providers/CampaignPgRepositoryProvider';
import { ServiceProvider } from '../../ServiceProvider';
import { CampaignInterface } from '../../interfaces';
import { PolicyEngine } from '../PolicyEngine';
import { MetadataRepositoryProvider } from '../../providers/MetadataRepositoryProvider';
import { trips as defaultTrips } from './trips';

interface TestContext extends KernelTestFn {
  policy: CampaignInterface;
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

    return {
      kernel,
      policy,
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
    const campaign = engine.buildCampaign(t.context.policy);
    for (const trip of trips) {
      const r = await engine.process(campaign, trip);
      incentives.push(...r);
    }
    t.log(incentives);
    t.is(
      incentives.length,
      trips
        .filter(
          (tr) =>
            tr
              .map((p) => [...p.start_territory_id, ...p.end_territory_id])
              .reduce((s, t) => {
                t.map((v) => s.add(v));
                return s;
              }, new Set())
              .has(policyDef.territory_id) &&
            tr.datetime >= policyDef.start_date &&
            tr.datetime <= policyDef.end_date,
        )
        .map((tr) => tr.length)
        .reduce((sum, i) => sum + i, 0),
    );
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
    const { kernel, policy } = await before();
    t.context.kernel = kernel;
    t.context.policy = policy;
  });
  test.after.always(async (t) => {
    const { kernel, policy } = t.context;
    await after({ kernel, policy });
  });

  return {
    results,
    before,
    after,
    test,
  };
}

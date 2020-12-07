import anyTest, { TestInterface, Macro, ExecutionContext } from 'ava';
import { kernel as kernelDecorator, KernelInterface } from '@ilos/common';
import { Kernel as AbstractKernel } from '@ilos/framework';
import { PostgresConnection } from '@ilos/connection-postgres';

import { TripInterface } from '../../interfaces';
import { CampaignPgRepositoryProvider } from '../../providers/CampaignPgRepositoryProvider';
import { ServiceProvider } from '../../ServiceProvider';
import { CampaignInterface } from '../../interfaces';
import { PolicyEngine } from '../PolicyEngine';
import { MetadataProvider } from '../meta/MetadataProvider';
import { trips as defaultTrips } from './trips';

interface TestContext {
  kernel: KernelInterface;
  engine: PolicyEngine;
  policyId: number;
  policy: CampaignInterface;
}

export function macro(
  policy: CampaignInterface,
): {
  test: TestInterface<TestContext>;
  results: Macro<
    [{ carpool_id: number; amount: number; meta?: { [k: string]: string } }[], TripInterface[]?],
    TestContext
  >;
} {
  const test = anyTest as TestInterface<TestContext>;

  @kernelDecorator({
    children: [ServiceProvider],
  })
  class Kernel extends AbstractKernel {}

  test.before(async (t) => {
    t.context.kernel = new Kernel();
    await t.context.kernel.bootstrap();
    const repository = t.context.kernel.get(ServiceProvider).get(CampaignPgRepositoryProvider);
    t.context.policy = await repository.create(policy);
    t.context.policyId = t.context.policy._id;
    t.context.engine = t.context.kernel.get(ServiceProvider).get(PolicyEngine);
  });

  test.after.always(async (t) => {
    if (t.context.policyId) {
      const connection = t.context.kernel.get(ServiceProvider).get(PostgresConnection).getClient();
      const campaignRepository = t.context.kernel.get(ServiceProvider).get(CampaignPgRepositoryProvider);
      const metaRepository = t.context.kernel.get(ServiceProvider).get(MetadataProvider);
      await connection.query({
        text: `DELETE FROM ${campaignRepository.table} WHERE _id = $1`,
        values: [t.context.policyId],
      });

      await connection.query({
        text: `DELETE FROM ${metaRepository.table} WHERE policy_id = $1`,
        values: [t.context.policyId],
      });
    }

    await t.context.kernel.shutdown();
  });

  const results: Macro<
    [{ carpool_id: number; amount: number; meta?: { [k: string]: string } }[], TripInterface[]?],
    TestContext
  > = async (
    t: ExecutionContext<TestContext>,
    expected: { carpool_id: number; amount: number; meta?: { [k: string]: string } }[],
    trips: TripInterface[] = defaultTrips,
  ) => {
    const incentives = [];
    const campaign = t.context.engine.buildCampaign(t.context.policy);
    for (const trip of trips) {
      const r = await t.context.engine.process(campaign, trip);
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
              .has(policy.territory_id) &&
            tr.datetime >= policy.start_date &&
            tr.datetime <= policy.end_date,
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
  };

  results.title = (providedTitle = '', input, expected): string => `${providedTitle} ${input} = ${expected}`.trim();

  return {
    test,
    results,
  };
}

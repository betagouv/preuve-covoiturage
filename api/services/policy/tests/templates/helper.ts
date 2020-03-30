import path from 'path';
import { kernel as kernelDecorator, IdentifierType } from '@ilos/common';
import { Kernel as AbstractKernel } from '@ilos/framework';
import { PostgresConnection } from '@ilos/connection-postgres';

import { CampaignPgRepositoryProvider } from '../../src/providers/CampaignPgRepositoryProvider';
import { ServiceProvider } from '../../src/ServiceProvider';
import { CampaignInterface } from '../../src/interfaces';
import { PolicyEngine } from '../../src/engine/PolicyEngine';
import { CampaignMetadataRepositoryProvider } from '../../src/engine/CampaignMetadataRepositoryProvider';

@kernelDecorator({
  children: [ServiceProvider],
})
class Kernel extends AbstractKernel {}

export function helper(): { get: Function; up: Function; down: Function } {
  const kernel = new Kernel();
  const configDir = process.env.APP_CONFIG_DIR ? process.env.APP_CONFIG_DIR : './config';
  process.env.APP_CONFIG_DIR = path.join('..', 'dist', configDir);
  const get = <T>(id: IdentifierType<T>): T => {
    return kernel.get(ServiceProvider).get<T>(id);
  };

  let policyId: number;

  return {
    get,
    async up(template: CampaignInterface): Promise<{ engine: PolicyEngine; policy: CampaignInterface }> {
      await kernel.bootstrap();
      const policy = await get(CampaignPgRepositoryProvider).create(template);
      policyId = policy._id;
      return {
        engine: get(PolicyEngine),
        policy,
      };
    },
    async down(): Promise<void> {
      if (policyId) {
        await get(PostgresConnection)
          .getClient()
          .query({
            text: `DELETE FROM ${get(CampaignPgRepositoryProvider).table} WHERE _id = $1`,
            values: [policyId],
          });

        await get(PostgresConnection)
          .getClient()
          .query({
            text: `DELETE FROM ${get(CampaignMetadataRepositoryProvider).table} WHERE policy_id = $1`,
            values: [policyId],
          });
      }

      await kernel.shutdown();
    },
  };
}

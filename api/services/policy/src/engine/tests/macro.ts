import { ExecutionContext } from 'ava';
import {
  MetadataRepositoryProviderInterfaceResolver,
  CarpoolInterface,
  MetadataLifetime,
  PolicyHandlerInterface,
  SerializedIncentiveInterface,
  SerializedPolicyInterface,
  SerializedStoredMetadataInterface,
} from '~/interfaces';
import { MetadataStore } from '../entities/MetadataStore';
import { Policy } from '../entities/Policy';
import { generateCarpool } from './helpers';

interface ProcessParams {
  carpool: Array<Partial<CarpoolInterface>>;
  handler?: PolicyHandlerInterface;
  policy?: Partial<SerializedPolicyInterface>;
  meta?: SerializedStoredMetadataInterface[];
}

interface ProcessResult {
  incentive: Array<number>;
  meta?: Array<{ key: string; value: number }>;
}

class MemoryMetadataRepository implements MetadataRepositoryProviderInterfaceResolver {
  constructor(public data: SerializedStoredMetadataInterface[] = []) {}

  async get(policyId: number, keys: string[], datetime?: Date): Promise<SerializedStoredMetadataInterface[]> {
    return this.data;
  }

  async set(data: SerializedStoredMetadataInterface[]): Promise<void> {
    this.data = data;
  }
}
export const process = async (t: ExecutionContext, input: ProcessParams, expected: ProcessResult) => {
  const policyDef: SerializedPolicyInterface = {
    _id: 1,
    territory_id: 1,
    territory_selector: {},
    name: '',
    start_date: new Date(),
    end_date: new Date(),
    status: 'active',
    handler: '',
    ...(input.policy || {}),
  };

  const policy = input.handler
    ? new Policy(
        policyDef._id,
        policyDef.territory_id,
        policyDef.territory_selector,
        policyDef.name,
        policyDef.start_date,
        policyDef.end_date,
        input.handler,
        policyDef.status,
      )
    : await Policy.import(policyDef);
  const store = new MetadataStore(new MemoryMetadataRepository(input.meta));
  const incentives: SerializedIncentiveInterface[] = [];
  for (const partialCarpool of input.carpool) {
    const carpool = generateCarpool(partialCarpool);
    const statelessIncentive = await policy.processStateless(carpool);
    const statefulIncentive = await policy.processStateful(store, statelessIncentive.export());
    incentives.push(statefulIncentive.export());
  }
  t.deepEqual(
    incentives.map((i) => i.statefulAmount),
    expected.incentive,
  );
  if (expected.meta) {
    t.deepEqual(
      (await store.store(MetadataLifetime.Day)).map((m) => ({ key: m.key, value: m.value })),
      expected.meta.map((m) => ({ key: m.key, value: m.value })),
    );
  }
};

import { KernelInterfaceResolver, NotFoundException } from '/ilos/common/index.ts';
import {
  ParamsInterface as FindByUuidParamsInterface,
  ResultInterface as FindByUuidResultInterface,
  signature as findByUuidSignature,
} from '/shared/operator/findbyuuid.contract.ts';
import {
  ParamsInterface as PolicyParamsInterface,
  ResultInterface as PolicyResultInterface,
  signature as policyFindSignature,
} from '/shared/policy/find.contract.ts';

export async function getCampaignOperators(
  kernel: KernelInterfaceResolver,
  service: string,
  _id: number,
): Promise<number[]> {
  try {
    const uuid = await getPolicyUuidList(kernel, service, _id);
    return await uuidToOperatorId(kernel, service, uuid);
  } catch (e) {
    // catch and log to avoid blocking the whole export
    // on error, the list will not be filtered
    console.warn(`[apdf:export] (campaign_id: ${_id}) Get declared operators failed: ${e.message}`);
    return [];
  }
}

export async function getPolicyUuidList(
  kernel: KernelInterfaceResolver,
  service: string,
  _id: number,
): Promise<string[]> {
  // Get the full campaign object with params and describe properties
  // throws if not found
  const policy = await kernel.call<PolicyParamsInterface, PolicyResultInterface>(
    policyFindSignature,
    { _id },
    {
      channel: { service },
      call: { user: { permissions: ['registry.policy.find'] } },
    },
  );

  const list = policy?.params?.operators || [];
  if (!list.length) throw new NotFoundException(`No UUID declared in policy ${_id}`);

  return list;
}

export async function uuidToOperatorId(
  kernel: KernelInterfaceResolver,
  service: string,
  uuid: string[],
): Promise<number[]> {
  const list = await kernel.call<FindByUuidParamsInterface, FindByUuidResultInterface>(
    findByUuidSignature,
    { uuid },
    {
      channel: { service },
      call: { user: { permissions: ['common.operator.find'] } },
    },
  );

  return list.map((i: FindByUuidResultInterface[0]) => i._id);
}

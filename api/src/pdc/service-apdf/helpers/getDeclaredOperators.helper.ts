import { KernelInterfaceResolver, NotFoundException } from '@ilos/common';
import {
  ParamsInterface as FindBySiretParamsInterface,
  ResultInterface as FindBySiretResultInterface,
  signature as findBySiretSignature,
} from '@shared/operator/findbysiret.contract';
import {
  ParamsInterface as PolicyParamsInterface,
  ResultInterface as PolicyResultInterface,
  signature as policyFindSignature,
} from '@shared/policy/find.contract';

export async function getDeclaredOperators(
  kernel: KernelInterfaceResolver,
  service: string,
  _id: number,
): Promise<number[]> {
  try {
    const siret = await getPolicySiretList(kernel, service, _id);
    return await siretToOperatorId(kernel, service, siret);
  } catch (e) {
    // catch and log to avoid blocking the whole export
    // on error, the list will not be filtered
    console.warn(`[apdf:export] (campaign_id: ${_id}) Get declared operators failed: ${e.message}`);
    return [];
  }
}

export async function getPolicySiretList(
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
  if (!list.length) throw new NotFoundException(`No SIRET declared in policy ${_id}`);

  return list;
}

export async function siretToOperatorId(
  kernel: KernelInterfaceResolver,
  service: string,
  siret: string[],
): Promise<number[]> {
  const list = await kernel.call<FindBySiretParamsInterface, FindBySiretResultInterface>(
    findBySiretSignature,
    { siret },
    {
      channel: { service },
      call: { user: { permissions: ['common.operator.find'] } },
    },
  );

  return list.map((i: FindBySiretResultInterface[0]) => i._id);
}

import { ContextType, ForbiddenException } from "@/ilos/common/index.ts";

export type Caller = { registry: boolean; operator_id: number | null; territory_id: number | null };
type Owned = {
  operator_ids: number[];
  created_by_operator_id: number | null;
  created_by_territory_id: number | null;
};

// L'équipe RPC se reconnaît à sa permission, pas à l'absence d'operator_id (mode simulation).
// Un périmètre est opérateur XOR territoire : on ne garde que celui de la session.
export function callerOf(
  context: Pick<ContextType, "call">,
  registryPermission = "registry.campaign_condition.update",
): Caller {
  const user = context?.call?.user;
  const permissions = (user?.permissions ?? []) as string[];
  const operator_id = user?.operator_id ?? null;
  return {
    registry: permissions.includes(registryPermission),
    operator_id,
    territory_id: operator_id === null ? user?.territory_id ?? null : null,
  };
}

const isOnly = (ids: number[], operatorId: number | null) =>
  operatorId !== null && ids.length === 1 && ids[0] === operatorId;

// Un opérateur ne déclare que des campagnes dont il est le seul opérateur (multi-opérateurs = équipe RPC
// ou territoire). Un territoire choisit ses opérateurs ; son territoire est imposé par l'API.
export function assertCanCreate(operatorIds: number[], caller: Caller): void {
  if (caller.registry || caller.territory_id !== null) return;
  if (!isOnly(operatorIds, caller.operator_id)) {
    throw new ForbiddenException("Une campagne multi-opérateurs est saisie par l'équipe RPC ou le territoire");
  }
}

export function assertCanWrite(existing: Owned, nextOperatorIds: number[] | null, caller: Caller): void {
  if (caller.registry) return;
  const owns = caller.territory_id !== null
    ? existing.created_by_territory_id === caller.territory_id
    : existing.created_by_operator_id === caller.operator_id && isOnly(existing.operator_ids, caller.operator_id);
  if (!owns) throw new ForbiddenException("Campagne en lecture seule : contactez l'équipe RPC");
  if (nextOperatorIds) assertCanCreate(nextOperatorIds, caller);
}

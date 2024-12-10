import { ContextType, ForbiddenException } from "@/ilos/common/index.ts";

export function getOperatorIdOrFail(context: ContextType): number {
  const { operator_id }: { operator_id: number } = context.call?.user || {};
  if (!operator_id || Number.isNaN(operator_id)) {
    throw new ForbiddenException();
  }
  return operator_id;
}

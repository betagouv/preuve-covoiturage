import { ContextType, UnauthorizedException } from "@/ilos/common/index.ts";

export function getOperatorIdOrFail(context: ContextType): number {
  const { operator_id }: { operator_id: number } = context.call?.user || {};
  if (!operator_id || Number.isNaN(operator_id)) {
    throw new UnauthorizedException();
  }
  return operator_id;
}

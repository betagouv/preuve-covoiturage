import { NotEligibleTargetException } from '../exceptions/NotEligibleTargetException';
import { MisconfigurationException } from '../exceptions/MisconfigurationException';
import { StatelessContextInterface, StatelessRuleHelper } from '../../interfaces';

export const isOperatorOrThrow: StatelessRuleHelper<Array<string>> = (
  ctx: StatelessContextInterface,
  operators: string[],
): boolean => {
  if (!Array.isArray(operators)) {
    throw new MisconfigurationException('operators must be an array');
  }

  if (!operators.length) {
    throw new NotEligibleTargetException('No operator allowed');
  }

  if (!operators.includes(ctx.carpool.operator_uuid)) {
    throw new NotEligibleTargetException(`Operator not allowed: ${ctx?.carpool?.operator_uuid}`);
  }
  return true;
};

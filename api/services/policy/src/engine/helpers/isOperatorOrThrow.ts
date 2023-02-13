import { StatelessContextInterface, StatelessRuleHelper } from '../../shared/policy/common/interfaces/PolicyInterface';
import { MisconfigurationException } from '../exceptions/MisconfigurationException';
import { NotEligibleTargetException } from '../exceptions/NotEligibleTargetException';

export const isOperatorOrThrow: StatelessRuleHelper<Array<string>> = (
  ctx: StatelessContextInterface,
  operators: string[],
): boolean => {
  if (!Array.isArray(operators) || !operators.length) {
    throw new MisconfigurationException();
  }
  if (!operators.includes(ctx.carpool.operator_siret)) {
    throw new NotEligibleTargetException();
  }
  return true;
};

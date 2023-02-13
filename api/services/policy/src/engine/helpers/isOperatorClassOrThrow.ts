import { StatelessContextInterface, StatelessRuleHelper } from '../../shared/policy/common/interfaces/PolicyInterface';
import { MisconfigurationException } from '../exceptions/MisconfigurationException';
import { NotEligibleTargetException } from '../exceptions/NotEligibleTargetException';

export const isOperatorClassOrThrow: StatelessRuleHelper<Array<string>> = (
  ctx: StatelessContextInterface,
  operatorClass: string[],
): boolean => {
  if (!Array.isArray(operatorClass) || !operatorClass.length) {
    throw new MisconfigurationException();
  }
  if (!operatorClass.includes(ctx.carpool.operator_class)) {
    throw new NotEligibleTargetException();
  }
  return true;
};

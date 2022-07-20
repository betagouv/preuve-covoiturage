import { NotEligibleTargetException } from '../exceptions/NotEligibleTargetException';
import { MisconfigurationException } from '../exceptions/MisconfigurationException';
import { StatelessContextInterface, StatelessRuleHelper } from '../interfaces';

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

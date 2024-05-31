import { NotEligibleTargetException } from '../exceptions/NotEligibleTargetException.ts';
import { MisconfigurationException } from '../exceptions/MisconfigurationException.ts';
import { StatelessContextInterface, StatelessRuleHelper } from '../../interfaces/index.ts';

export const isOperatorClassOrThrow: StatelessRuleHelper<Array<string>> = (
  ctx: StatelessContextInterface,
  operatorClass: string[],
): boolean => {
  if (!Array.isArray(operatorClass) || !operatorClass.length) {
    throw new MisconfigurationException();
  }
  if (!operatorClass.includes(ctx.carpool.operator_class)) {
    throw new NotEligibleTargetException(`Operator class not allowed: ${ctx?.carpool?.operator_class}`);
  }
  return true;
};

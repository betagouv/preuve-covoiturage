import { NotEligibleTargetException } from '../exceptions/NotEligibleTargetException';
import { MisconfigurationException } from '../exceptions/MisconfigurationException';
import { StatelessContextInterface, StatelessRuleHelper } from '../../interfaces';

export const isOperatorOrThrow: StatelessRuleHelper<Array<string>> = (
  ctx: StatelessContextInterface,
  operators: string[],
): boolean => {
  if (!Array.isArray(operators) || !operators.length) {
    throw new MisconfigurationException();
  }
  if (!operators.includes(ctx.carpool.operator_siret)) {
    throw new NotEligibleTargetException(`Operator not allowed: ${ctx?.carpool?.operator_siret}`);
  }
  return true;
};

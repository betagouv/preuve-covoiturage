import { ApplicableRuleInterface } from '../interfaces/RuleInterface';

export class RuleException extends Error {
  constructor(public rule: ApplicableRuleInterface) {
    super(rule.description);
  }
}

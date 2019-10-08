import { ApplicableRuleInterface } from '../interfaces/RuleInterfaces';

export class RuleException extends Error {
  constructor(public rule: ApplicableRuleInterface) {
    super(rule.description);
  }
}

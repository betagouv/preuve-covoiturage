import { AbstractRuleSet } from './AbstractRuleSet';
import { FilterRuleInterface, RuleHandlerContextInterface, RuleHandlerParamsInterface, StaticRuleInterface } from '../interfaces';
import { type, FILTER } from '../helpers/type';
import { NotApplicableTargetException } from '../exceptions/NotApplicableTargetException';

export class FilterRuleSet extends AbstractRuleSet<FilterRuleInterface> implements FilterRuleInterface {
  readonly type: type = FILTER;

  constructor(rules: { ctor: StaticRuleInterface; params?: any }[]) {
    super();
    this.getRules(this.type, rules);
  }

  apply(context: RuleHandlerParamsInterface): void {
    const { result, ...ctx } = context;
    this.filter(ctx);
  }

  filter(context: RuleHandlerContextInterface): void {
    [...this.ruleSet].map((r) => {
      try {
        r.filter(context);
        context.stack.push(`${(this.ruleSet[0].constructor as StaticRuleInterface).slug} : pass`);
      } catch (e) {
        if (e instanceof NotApplicableTargetException) {
          context.stack.push(`${(this.ruleSet[0].constructor as StaticRuleInterface).slug} : failed`);
        }
        throw e;
      }
    });
  }
}

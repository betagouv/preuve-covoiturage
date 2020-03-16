import {
  RuleInterface,
  RuleHandlerParamsInterface,
} from './interfaces';
import { NotApplicableTargetException } from './exceptions/NotApplicableTargetException';
import { RuleSet } from './RuleSet';

export class ProcessableCampaign extends RuleSet {
  protected ruleSets: RuleSet[];

  constructor(globalRules: RuleInterface[], rules: RuleInterface[][]) {
    super(globalRules);
    this.ruleSets = rules.map((set) => new RuleSet(set));
  }

  apply(context: RuleHandlerParamsInterface): void {
    let { result, ...ctx } = context;
    try {
      result = 0;
      this.filter(ctx);
      ctx = this.transform(ctx);

      for (const ruleSet of this.ruleSets) {
        const currentContext = { ...ctx, result: 0 };
        try {
          ruleSet.apply(currentContext);
        } catch (e) {
          if (!(e instanceof NotApplicableTargetException)) {
            throw e;
          }
          context.stack.push(e.message);
        }
        result += currentContext.result;
      }

      context.stack.push(`result: ${result}`);
      context.result = this.modify(ctx, result);
      this.nativeApply({ ...ctx, result });
    } catch (e) {
      if (!(e instanceof NotApplicableTargetException)) {
        throw e;
      }
      context.stack.push(e.message);
      context.result = 0;
    }
  }
}

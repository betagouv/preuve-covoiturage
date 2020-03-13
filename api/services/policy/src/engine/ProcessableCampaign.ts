import {
  RuleInterface,
  StaticRuleInterface,
  MetaRuleInterface,
  FilterRuleInterface,
  SetterRuleInterface,
  ModifierRuleInterface,
  TransformerRuleInterface,
  RuleHandlerContextInterface,
  RuleHandlerParamsInterface,
  AppliableRuleInterface,
} from './interfaces';
import { rules as availableRules } from './rules';
import { META, FILTER, TRANSFORMER, SETTER, MODIFIER, POST } from './helpers/type';
import { UnprocessableRuleSetException } from './exceptions/UnprocessableRuleSetException';
import { NotApplicableTargetException } from './exceptions/NotApplicableTargetException';

/* 
  Build a rule set from definition 
  1. Resolve rule
  1bis. Unwrap
  2. Sort rule
  3. Compile rule
  4. Apply
*/
class RuleSet
  implements
    FilterRuleInterface,
    TransformerRuleInterface,
    SetterRuleInterface,
    ModifierRuleInterface,
    AppliableRuleInterface {
  protected filterSet: FilterRuleInterface[];
  protected transformerSet: TransformerRuleInterface[];
  protected setterSet: SetterRuleInterface[];
  protected modifierSet: ModifierRuleInterface[];
  protected nativeSet: AppliableRuleInterface[];

  protected availableRules: StaticRuleInterface[] = availableRules;

  constructor(ruleDefinitions: RuleInterface[]) {
    this.sort(this.resolve(ruleDefinitions));
  }

  resolve(ruleDefinitions: RuleInterface[]): { ctor: StaticRuleInterface; def: RuleInterface }[] {
    return ruleDefinitions
      .map((def) => ({
        def,
        ctor: this.availableRules.find((p) => p.slug === def.slug),
      }))
      .map(({ ctor, def }) => {
        if (ctor === undefined) {
          throw new UnprocessableRuleSetException(`Unknown rule ${def.slug}`);
        }
        return { ctor, def };
      })
      .reduce((acc, { ctor, def }) => {
        if (ctor.type === META) {
          acc.push(...this.resolve((new ctor(def.parameters) as MetaRuleInterface).build()));
        } else {
          acc.push({ ctor, def });
        }
        return acc;
      }, []);
  }

  protected instanciate<T>(ctor: StaticRuleInterface, def: RuleInterface): T {
    return new ctor(def.parameters) as T;
  }

  // order by priority
  sort(rules: { ctor: StaticRuleInterface; def: RuleInterface }[]): void {
    this.filterSet = rules
      .filter(({ ctor }) => ctor.type === FILTER)
      .map((r) => this.instanciate<FilterRuleInterface>(r.ctor, r.def));
    this.transformerSet = rules
      .filter(({ ctor }) => ctor.type === TRANSFORMER)
      .map((r) => this.instanciate<TransformerRuleInterface>(r.ctor, r.def));
    this.setterSet = rules
      .filter(({ ctor }) => ctor.type === SETTER)
      .map((r) => this.instanciate<SetterRuleInterface>(r.ctor, r.def));
    this.modifierSet = rules
      .filter(({ ctor }) => ctor.type === MODIFIER)
      .map((r) => this.instanciate<ModifierRuleInterface>(r.ctor, r.def));
    this.nativeSet = rules
      .filter(({ ctor }) => ctor.type === DEFAULT)
      .map((r) => this.instanciate<AppliableRuleInterface>(r.ctor, r.def));
  }

  apply(context: RuleHandlerParamsInterface): void {
    let { result, ...ctx } = context;
    this.filter(ctx);
    ctx = this.transform(ctx);
    result = this.set(ctx);
    context.result = this.modify(ctx, result);
    context.stack.push(`pathresult: ${context.result}`);
    this.nativeApply(context);
  }

  protected nativeApply(context: RuleHandlerParamsInterface): void {
    for (const rule of this.nativeSet) {
      rule.apply(context);
      context.stack.push(`${(rule.constructor as StaticRuleInterface).slug}: ${context.result}`);
    }
  }

  filter(context: RuleHandlerContextInterface): void {
    [...this.filterSet].map((r) => r.filter(context));
  }

  modify(context: RuleHandlerContextInterface, result: number): number {
    if (this.modifierSet.length === 0) {
      return result;
    }

    let currentResult = result;
    for (const rule of this.modifierSet) {
      currentResult = rule.modify(context, currentResult);
      context.stack.push(`${(rule.constructor as StaticRuleInterface).slug} : ${currentResult}`);
    }

    return currentResult;
  }

  set(context: RuleHandlerContextInterface): number {
    let result = 0;
    if (this.setterSet.length > 0) {
      // take the first, ignore others
      result = this.setterSet[0].set(context);
      context.stack.push(`${(this.setterSet[0].constructor as StaticRuleInterface).slug} : ${result}`);
    }
    return result;
  }

  transform(context: RuleHandlerContextInterface): RuleHandlerContextInterface {
    if (this.transformerSet.length === 0) {
      return context;
    }

    let currentContext = JSON.parse(JSON.stringify(context));
    for (const rule of this.transformerSet) {
      currentContext = rule.transform(currentContext);
    }

    return currentContext;
  }
}

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

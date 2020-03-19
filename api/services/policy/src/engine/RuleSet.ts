import {
  RuleInterface,
  StaticRuleInterface,
  FilterRuleInterface,
  SetterRuleInterface,
  ModifierRuleInterface,
  TransformerRuleInterface,
  RuleHandlerContextInterface,
  RuleHandlerParamsInterface,
  AppliableRuleInterface,
} from './interfaces';
import { FILTER, TRANSFORMER, SETTER, MODIFIER, DEFAULT } from './helpers/type';
import { AbstractRuleSet } from './AbstractRuleSet';

export class RuleSet extends AbstractRuleSet 
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

  constructor(ruleDefinitions: RuleInterface[]) {
    super();
    this.sort(this.resolve(ruleDefinitions));
  }

  // order by priority
  protected sort(rules: { ctor: StaticRuleInterface; def: RuleInterface }[]): void {
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

  nativeApply(context: RuleHandlerParamsInterface): void {
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

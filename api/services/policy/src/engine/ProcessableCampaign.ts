import {
  RuleInterface,
  StaticRuleInterface,
  MetaOrApplicableRuleInterface,
  MetaRuleInterface,
  FilterRuleInterface,
  SetterRuleInterface,
  ModifierRuleInterface,
  TransformerRuleInterface,
  RuleHandlerContextInterface,
  RuleHandlerParamsInterface
} from './interfaces';
import { rules as availableRules } from './rules';
import { META, FILTER, TRANSFORMER, SETTER, MODIFIER } from './helpers/type';
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
class RuleSet {
  protected filterNativeSet: FilterRuleInterface[];
  protected filterSqlSet: FilterRuleInterface[];
  protected transformerSet: TransformerRuleInterface[];
  protected setterSet: SetterRuleInterface[];
  protected modifierSet: ModifierRuleInterface[];

  protected availableRules: StaticRuleInterface[] = availableRules;

  constructor(
    ruleDefinitions: RuleInterface[],
  ) {
      this.sort(
        this.resolve(ruleDefinitions)
      );
  }

  resolve(ruleDefinitions: RuleInterface[]): { ctor: StaticRuleInterface, def: RuleInterface }[] {
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
        if(ctor.type === META) {
          acc.push(
            ...this.resolve(
              (new ctor(def.parameters) as MetaRuleInterface).build()
            ),
          );
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
  sort(rules: { ctor: StaticRuleInterface, def: RuleInterface }[]): void {
    this.filterNativeSet = rules.filter(({ ctor }) => ctor.type === FILTER && !ctor.prototype.filterSql).map((r) => this.instanciate<FilterRuleInterface>(r.ctor, r.def));
    this.filterSqlSet = rules.filter(({ ctor }) => ctor.type === FILTER && ctor.prototype.filterSql).map((r) => this.instanciate<FilterRuleInterface>(r.ctor, r.def));
    this.transformerSet = rules.filter(({ ctor }) => ctor.type === TRANSFORMER).map((r) => this.instanciate<TransformerRuleInterface>(r.ctor, r.def));
    this.setterSet = rules.filter(({ ctor }) => ctor.type === SETTER).map((r) => this.instanciate<SetterRuleInterface>(r.ctor, r.def));
    this.modifierSet = rules.filter(({ ctor }) => ctor.type === MODIFIER).map((r) => this.instanciate<ModifierRuleInterface>(r.ctor, r.def));
  }

  async apply(context: RuleHandlerParamsInterface): Promise<void> {
    let { result, ...ctx } = context;
    await this.filter(ctx);
    ctx = await this.transform(ctx);
    result = await this.set(ctx);
    context.result = await this.modify(ctx, result);
    context.stack.push(`pathresult: ${context.result}`);
  }

  filterSql(): { text: string, values: any[] } {
    const filters = [];
    for(const rule of this.filterSqlSet) {
      filters.push(rule.filterSql());
    }
    return {
      text: filters.map(f => f.text).join(' AND '),
      values: filters.map(f => f.values).reduce((acc, curr) => {
        acc.push(...curr);
        return acc;
      }, []),
    };
  }

  async filter(context: RuleHandlerContextInterface): Promise<void> {
    await Promise.all([...this.filterNativeSet].map(r => r.filter(context)));
  }

  async modify(context: RuleHandlerContextInterface, result: number): Promise<number> {
    if (this.modifierSet.length === 0) {
      return result;
    }

    let currentResult = result;
    for(const rule of this.modifierSet) {
      currentResult = await rule.modify(context, currentResult);
      context.stack.push(`${(rule.constructor as StaticRuleInterface).slug} : ${currentResult}`);
    }

    return currentResult;
  }

  async set(context: RuleHandlerContextInterface): Promise<number> {
    let result: number = 0;
    if (this.setterSet.length > 0) {
      result = await this.setterSet[0].set(context);
      context.stack.push(`${(this.setterSet[0].constructor as StaticRuleInterface).slug} : ${result}`);
    }
    return result;
  }

  async transform(context: RuleHandlerContextInterface): Promise<RuleHandlerContextInterface> {
    if (this.transformerSet.length === 0) {
      return context;
    }

    let currentContext = JSON.parse(JSON.stringify(context));
    for(const rule of this.transformerSet) {
      currentContext = await rule.transform(currentContext);
    }

    return currentContext;
  }
}

export class Campaign extends RuleSet {
  protected ruleSets: RuleSet[];

  constructor(
    globalRules: RuleInterface[],
    rules: RuleInterface[][],
  ) {
    super(globalRules);
    this.ruleSets = rules.map((set) => new RuleSet(set));
  }

  async apply(context: RuleHandlerParamsInterface): Promise<void> {
    let { result, ...ctx } = context;
    try {
      result = 0;
      await this.filter(ctx);
      ctx = await this.transform(ctx);

      for(const ruleSet of this.ruleSets) {
        const currentContext = { ...ctx, result: 0 };
        try {
          await ruleSet.apply(currentContext);
        } catch(e) {
          if (!(e instanceof NotApplicableTargetException)) {
            throw e;
          }
          context.stack.push(e.message);
        }
        result += currentContext.result;
      }
  
      context.stack.push(`result: ${result}`);
      context.result = await this.modify(ctx, result);
    } catch(e) {
      if (!(e instanceof NotApplicableTargetException)) {
        throw e;
      }
      context.stack.push(e.message);
      context.result = 0;
    }
  }
}

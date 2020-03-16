import {
  RuleInterface,
  StaticRuleInterface,
  MetaRuleInterface,
} from './interfaces';
import { rules as availableRules } from './rules';
import { META } from './helpers/type';
import { UnprocessableRuleSetException } from './exceptions/UnprocessableRuleSetException';

export abstract class AbstractRuleSet {
  protected availableRules: StaticRuleInterface[] = availableRules;

  protected resolve(ruleDefinitions: RuleInterface[]): { ctor: StaticRuleInterface; def: RuleInterface }[] {
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
}

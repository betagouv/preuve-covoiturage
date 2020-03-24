import { StaticRuleInterface } from '../interfaces';
import { type } from '../helpers/type';

export abstract class AbstractRuleSet<R> {
  abstract readonly type: type;
  protected ruleSet: R[];

  protected getRules(type: type, rules: { ctor: StaticRuleInterface; params?: any }[]): void {
    this.ruleSet = rules.filter(({ ctor }) => ctor.type === type).map((r) => this.instanciate<R>(r.ctor, r.params));
  }

  protected instanciate<T>(ctor: StaticRuleInterface, params?: any): T {
    return new ctor(params) as T;
  }
}
